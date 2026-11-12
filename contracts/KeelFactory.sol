// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract KeelToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public admin;
    string public image;
    string public metadata;
    bool private _init;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        _init = true;
    }

    function initialize(
        string calldata _name,
        string calldata _symbol,
        uint256 supply,
        address owner,
        string calldata _image,
        string calldata _metadata
    ) external {
        require(!_init, "init");
        _init = true;
        name = _name;
        symbol = _symbol;
        admin = owner;
        image = _image;
        metadata = _metadata;
        totalSupply = supply;
        balanceOf[owner] = supply;
        emit Transfer(address(0), owner, supply);
    }

    function setMeta(string calldata _image, string calldata _metadata) external {
        require(msg.sender == admin, "admin");
        image = _image;
        metadata = _metadata;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _move(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "allow");
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        _move(from, to, amount);
        return true;
    }

    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "bal");
        unchecked {
            balanceOf[msg.sender] -= amount;
            totalSupply -= amount;
        }
        emit Transfer(msg.sender, address(0), amount);
    }

    function _move(address from, address to, uint256 amount) internal {
        require(to != address(0), "to");
        require(balanceOf[from] >= amount, "bal");
        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }
}

contract KeelFactory {
    address public implementation;

    event Launched(address indexed token, address indexed bot, address indexed admin, string name, string symbol);

    constructor() {
        implementation = address(new KeelToken());
    }

    function deploy(
        string calldata name,
        string calldata symbol,
        uint256 supply,
        address admin,
        string calldata image,
        string calldata metadata,
        address bot
    ) external returns (address token) {
        token = _clone(implementation);
        KeelToken(token).initialize(name, symbol, supply, admin, image, metadata);
        emit Launched(token, bot, admin, name, symbol);
    }

    function _clone(address impl) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, impl))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "clone");
    }
}
