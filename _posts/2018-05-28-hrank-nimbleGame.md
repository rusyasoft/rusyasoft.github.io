---
title: Hackerrank, Nimble Game
categories:
 - Competitive Programming
tags:
 - hackerrank
---

Original definition of the problem is given at [hackerrank](https://www.hackerrank.com/challenges/nimble-game-1/problem). In order to avoid copyright related issues, I would like to not keep the definition of the problem in here.

# Solution Description
If the cell contains even number of stones then we should ignore those cells in our calculations. Because they would have no effect on the result, every move can be repeated by the opposite player. In our case the move started by First player will be repeated by Second player. Eventually First user becomes a looser. Cells that contains odd numbers have an impact to the result of the game. If we filter out the cells with odd numbered stones, then we can start converting this game to basic Nim game. If we convert then the cell index (position) becomes a number of stones in the basic Nim game. Then just apply nim game solution, which is XOR ing all values and if 0 then Second player wins, otherwise First player.

![NoImage](/assets/images/NimbleGameToNimGame.png)


# Solution Source Code

```java
static String nimbleGame(int[] s) {
        int sum = 0;
        for (int i = 0; i < s.length; i++) {
            //sum += s[i];
            if (s[i] % 2 == 1) {
                sum ^= i;            
            }
        }
        
        if (sum == 0) {
            return "Second";
        } else {
            return "First";
        }

    }
```



