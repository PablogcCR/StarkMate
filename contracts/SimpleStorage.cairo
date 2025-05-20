#[starknet::interface]
trait ISimpleStorage {
    fn get_value() -> u256;
    fn set_value(new_value: u256);
}

#[starknet::contract]
mod SimpleStorage {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    struct Storage {
        value: u256,
    }

    #[external(v0)]
    impl SimpleStorage of super::ISimpleStorage {
        fn get_value(self: @ContractState) -> u256 {
            self.value.read()
        }

        fn set_value(ref self: ContractState, new_value: u256) {
            self.value.write(new_value);
        }
    }
} 