// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * MockUSDC — a testnet stablecoin that behaves like real USDC in the MegiLance UI.
 *
 * - 6 decimals (same as production USDC)
 * - Public `mint(address,uint256)` so the app's "Get test USDC" faucet button works
 *   (anyone can mint to themselves for testing — DO NOT deploy this to mainnet).
 * - `faucet()` convenience that mints 1,000 USDC to the caller.
 *
 * Deploy on a testnet (e.g. Polygon Amoy / Sepolia), then set its address in the backend:
 *   STABLECOIN_TOKENS={"80002":{"USDC":{"address":"0xYourMockAddress","decimals":6,"faucet":true}}}
 * (See contracts/README.md for the one-click Remix steps.)
 */
contract MockUSDC {
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public constant decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /// Mint tokens to any address — open for testnet faucet use only.
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    /// Convenience faucet: mints 1,000 USDC to the caller.
    function faucet() external {
        uint256 amount = 1000 * 10 ** decimals;
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "insufficient balance");
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
