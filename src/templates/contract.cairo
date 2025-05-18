# Ejemplo de contrato Cairo
%lang starknet

@contract_interface
trait IHelloStarknet {
    fn say_hello() -> felt252;
}

@storage_var
def message() -> felt252:
end

@external
def constructor(initial_message: felt252):
    message.write(initial_message)
    return ()
end

@external
def say_hello() -> felt252:
    return message.read()
end 