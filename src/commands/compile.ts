import { execSync } from 'child_process';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

/**
 * Verifica si Cairo está instalado correctamente en WSL
 */
function checkCairoInstallation(): boolean {
    try {
        execSync('wsl cairo-compile --version', { stdio: 'ignore' });
        execSync('wsl cairo-compile-casm --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Convierte una ruta de Windows a una ruta de WSL
 */
function convertToWslPath(windowsPath: string): string {
    // Convertir la ruta de Windows a formato WSL
    const wslPath = windowsPath.replace(/\\/g, '/').replace(/^([A-Z]):/, '/mnt/$1');
    return wslPath;
}

/**
 * Compila un contrato Cairo 1.x y genera archivos .sierra.json y .casm.json
 * @param contractPath Ruta al archivo .cairo
 * @param outDir Directorio de salida (por defecto 'out')
 * @param options Opciones adicionales de compilación
 */
export function compileContract(
    contractPath: string,
    outDir: string = 'out',
    options: {
        replaceIds?: boolean;
        allowedLibfuncs?: string[];
        singleFile?: boolean;
    } = {}
) {
    try {
        // Verificar instalación de Cairo en WSL
        if (!checkCairoInstallation()) {
            throw new Error('Cairo no está instalado correctamente en WSL. Por favor, instala Cairo en WSL siguiendo la documentación oficial.');
        }

        // Validar extensión del archivo
        if (!contractPath.endsWith('.cairo')) {
            throw new Error('El archivo debe tener extensión .cairo');
        }

        // Validar que el archivo existe
        if (!fs.existsSync(contractPath)) {
            throw new Error(`El archivo ${contractPath} no existe`);
        }

        // Crear directorio de salida si no existe
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const baseName = path.basename(contractPath, '.cairo');
        const sierraPath = path.join(outDir, `${baseName}.sierra.json`);
        const casmPath = path.join(outDir, `${baseName}.casm.json`);

        // Convertir rutas a formato WSL
        const wslContractPath = convertToWslPath(contractPath);
        const wslSierraPath = convertToWslPath(sierraPath);
        const wslCasmPath = convertToWslPath(casmPath);

        // Construir comando de compilación con opciones
        let compileCommand = `wsl cairo-compile ${wslContractPath} --output ${wslSierraPath}`;
        if (options.replaceIds) compileCommand += ' --replace-ids';
        if (options.allowedLibfuncs) compileCommand += ` --allowed-libfuncs ${options.allowedLibfuncs.join(',')}`;
        if (options.singleFile) compileCommand += ' --single-file';

        // Compilar a Sierra
        console.log(chalk.blue('📦 Compilando a Sierra...'));
        execSync(compileCommand, { stdio: 'inherit' });

        // Compilar a Casm
        console.log(chalk.blue('📦 Compilando a Casm...'));
        execSync(`wsl cairo-compile-casm ${wslSierraPath} --output ${wslCasmPath}`, { stdio: 'inherit' });

        console.log(chalk.green('✅ Contrato compilado correctamente:'));
        console.log(chalk.green(`   - Sierra: ${sierraPath}`));
        console.log(chalk.green(`   - Casm: ${casmPath}`));
    } catch (error: any) {
        console.error(chalk.red('❌ Error al compilar el contrato:'));
        if (error.message) {
            console.error(chalk.red(`   ${error.message}`));
        }
        if (error.stdout) {
            console.error(chalk.yellow('   Salida del compilador:'));
            console.error(chalk.yellow(`   ${error.stdout.toString()}`));
        }
        process.exit(1);
    }
} 