"use client";

import { useEffect, useState } from "react";
import { Code, Terminal } from "lucide-react";

const codeSnippets = [
  `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}`,
  `class Solution {
  public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
      int complement = target - nums[i];
      if (map.containsKey(complement)) {
        return new int[]{map.get(complement), i};
      }
      map.put(nums[i], i);
    }
    return new int[]{};
  }
}`,
  `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)`,
];

export function CodingAnimation() {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const snippet = codeSnippets[currentSnippet];
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= snippet.length) {
        setDisplayedCode(snippet.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        
        // Wait before starting next snippet
        setTimeout(() => {
          setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
          setDisplayedCode("");
          setIsTyping(true);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentSnippet]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-card/20 rounded-lg border border-border/50 overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card/80 border-b border-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-jetbrains-mono">hackathon-plus</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground font-jetbrains-mono">
            ~/hackathon-plus/challenges
          </span>
        </div>
        
        <div className="font-jetbrains-mono text-sm leading-relaxed">
          <div className="text-green-400 mb-2">$ ./run-challenge</div>
          <div className="text-blue-400 mb-4">Running algorithm challenge...</div>
          
          <div className="bg-card/50 p-4 rounded border border-border/30">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-jetbrains-mono">
              {displayedCode}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
              )}
            </pre>
          </div>
          
          <div className="mt-4 text-yellow-400 font-jetbrains-mono">
            {!isTyping && "✓ Challenge completed successfully!"}
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-8 w-1 h-1 bg-accent/30 rounded-full animate-ping"></div>
        <div className="absolute top-32 left-16 w-1.5 h-1.5 bg-primary/25 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
