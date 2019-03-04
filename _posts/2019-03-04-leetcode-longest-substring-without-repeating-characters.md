---
title: LeetCode, 
categories:
 - Competitive Programming
tags:
 - hackerrank
---



```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> table = new HashMap<>();
        
        int strLen = s.length();
        int startIndex = 0;
        int endIndex = 0;
        int maxLen = 0;
        for (endIndex = 0; endIndex < strLen;) {
            char ch = s.charAt(endIndex);
            if (!table.containsKey(ch)) {
                table.put(ch, 1);
                endIndex++;
                
                // get maxLen
                if (maxLen < endIndex - startIndex) {
                    maxLen = endIndex - startIndex;
                }
                
                
                
            } else {
                table.remove(s.charAt(startIndex));
                startIndex++;
            }
            //System.out.println("startIndex: " + startIndex+ " endIndex: " + endIndex + " maxLen: " + maxLen + " ch: " + ch);
        }
        
        return maxLen;
    }
}
```