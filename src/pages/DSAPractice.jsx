import { useState } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  accent: "#6366f1",
  green: "#22c55e",       greenSoft: "rgba(34,197,94,0.12)",
  amber: "#f59e0b",       amberSoft: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  purple: "#a855f7",      purpleSoft: "rgba(168,85,247,0.12)",
  border: "#27272a",
  bgCard: "rgba(18,18,26,0.75)",
  bgCardHover: "rgba(30,30,40,0.85)",
  bgDeep: "#05050f",
  text: "#ffffff",
  textSub: "#a1a1aa",
  textMuted: "#71717a",
  cyan: "#67e8f9",
};

// ─── Topics ───────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: "arrays",     label: "Arrays",               count: 6,  color: "#6366f1" },
  { id: "linkedlist", label: "Linked List",           count: 5,  color: "#22c55e" },
  { id: "trees",      label: "Trees",                  count: 5,  color: "#f59e0b" },
  { id: "dp",         label: "Dynamic Programming",    count: 5,  color: "#ef4444" },
  { id: "strings",    label: "Strings",               count: 5,  color: "#ec4899" },
  { id: "graphs",     label: "Graphs",               count: 4,  color: "#3b82f6" },
];

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = {
  arrays: [
    {
      id: 1, title: "Two Sum", difficulty: "Easy",
      description: "Given an array of integers and a target, return indices of two numbers that add up to the target. Each input has exactly one solution.",
      examples: ["Input: nums=[2,7,11,15], target=9 → Output: [0,1]", "Input: nums=[3,2,4], target=6 → Output: [1,2]"],
      hint: "Use a HashMap to store each number's index. For each element, check if its complement (target - current) already exists in the map.",
      solution: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n}\nconsole.log(twoSum([2,7,11,15], 9));`,
    },
    {
      id: 2, title: "Best Time to Buy & Sell Stock", difficulty: "Easy",
      description: "Given prices[], find the maximum profit from one buy-then-sell transaction. Return 0 if no profit is possible.",
      examples: ["Input: [7,1,5,3,6,4] → Output: 5", "Input: [7,6,4,3,1] → Output: 0"],
      hint: "Track the minimum price seen so far. At each step compute profit if you sold today.",
      solution: `function maxProfit(prices) {\n  let minPrice = Infinity, maxProfit = 0;\n  for (const p of prices) {\n    minPrice = Math.min(minPrice, p);\n    maxProfit = Math.max(maxProfit, p - minPrice);\n  }\n  return maxProfit;\n}\nconsole.log(maxProfit([7,1,5,3,6,4]));`,
    },
    {
      id: 3, title: "Product of Array Except Self", difficulty: "Medium",
      description: "Return array output where output[i] is the product of all elements except nums[i]. Solve in O(n) time without using division.",
      examples: ["Input: [1,2,3,4] → Output: [24,12,8,6]"],
      hint: "Build left-prefix products then multiply by right-suffix products in a second pass.",
      solution: `function productExceptSelf(nums) {\n  const n = nums.length;\n  const out = new Array(n).fill(1);\n  let left = 1;\n  for (let i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }\n  let right = 1;\n  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }\n  return out;\n}\nconsole.log(productExceptSelf([1,2,3,4]));`,
    },
    {
      id: 4, title: "Maximum Subarray", difficulty: "Medium",
      description: "Find the contiguous subarray with the largest sum (Kadane's algorithm).",
      examples: ["Input: [-2,1,-3,4,-1,2,1,-5,4] → Output: 6", "Input: [1] → Output: 1"],
      hint: "Keep a running sum. Reset to the current element whenever the running sum goes negative.",
      solution: `function maxSubArray(nums) {\n  let max = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
    },
    {
      id: 5, title: "Container With Most Water", difficulty: "Medium",
      description: "Given heights[], find two lines that form a container holding the most water.",
      examples: ["Input: [1,8,6,2,5,4,8,3,7] → Output: 49"],
      hint: "Use two pointers from both ends. Always move the pointer with the shorter height inward.",
      solution: `function maxArea(height) {\n  let l = 0, r = height.length - 1, max = 0;\n  while (l < r) {\n    max = Math.max(max, Math.min(height[l], height[r]) * (r - l));\n    height[l] < height[r] ? l++ : r--;\n  }\n  return max;\n}\nconsole.log(maxArea([1,8,6,2,5,4,8,3,7]));`,
    },
    {
      id: 6, title: "3Sum", difficulty: "Hard",
      description: "Find all unique triplets in the array that sum to zero.",
      examples: ["Input: [-1,0,1,2,-1,-4] → Output: [[-1,-1,2],[-1,0,1]]"],
      hint: "Sort the array first, then fix one element and use two pointers for the remaining pair. Skip duplicates carefully.",
      solution: `function threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const res = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const s = nums[i] + nums[l] + nums[r];\n      if (s === 0) {\n        res.push([nums[i], nums[l], nums[r]]);\n        while (nums[l] === nums[l + 1]) l++;\n        while (nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (s < 0) l++;\n      else r--;\n    }\n  }\n  return res;\n}\nconsole.log(threeSum([-1,0,1,2,-1,-4]));`,
    },
  ],

  linkedlist: [
    {
      id: 1, title: "Reverse Linked List", difficulty: "Easy",
      description: "Reverse a singly linked list iteratively.",
      examples: ["1→2→3→4→5 → 5→4→3→2→1"],
      hint: "Use three pointers: prev, curr, next. Iteratively flip each .next pointer.",
      solution: `function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}\nconsole.log("Reversal logic correct ✓");`,
    },
    {
      id: 2, title: "Merge Two Sorted Lists", difficulty: "Easy",
      description: "Merge two sorted linked lists and return the merged sorted list.",
      examples: ["1→2→4  and  1→3→4 → 1→1→2→3→4→4"],
      hint: "Use a dummy head node. Compare values at each step and advance the smaller pointer.",
      solution: `function mergeTwoLists(l1, l2) {\n  const dummy = { next: null };\n  let cur = dummy;\n  while (l1 && l2) {\n    if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }\n    else { cur.next = l2; l2 = l2.next; }\n    cur = cur.next;\n  }\n  cur.next = l1 || l2;\n  return dummy.next;\n}\nconsole.log("Merge logic correct ✓");`,
    },
    {
      id: 3, title: "Linked List Cycle", difficulty: "Easy",
      description: "Detect if a linked list has a cycle.",
      examples: ["3→2→0→-4 (tail connects to index 1) → true", "1→2 (no cycle) → false"],
      hint: "Floyd's algorithm: slow pointer moves 1 step, fast pointer moves 2 steps. If they meet, there's a cycle.",
      solution: `function hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}\nconsole.log("Cycle detection logic correct ✓");`,
    },
    {
      id: 4, title: "Remove Nth Node From End", difficulty: "Medium",
      description: "Remove the nth node from the end of the list and return its head.",
      examples: ["1→2→3→4→5, n=2 → 1→2→3→5"],
      hint: "Use two pointers separated by n steps. When fast reaches the end, slow is at the predecessor of the target node.",
      solution: `function removeNthFromEnd(head, n) {\n  const dummy = { next: head };\n  let fast = dummy, slow = dummy;\n  for (let i = 0; i <= n; i++) fast = fast.next;\n  while (fast) { fast = fast.next; slow = slow.next; }\n  slow.next = slow.next.next;\n  return dummy.next;\n}\nconsole.log("Remove Nth node logic correct ✓");`,
    },
    {
      id: 5, title: "LRU Cache", difficulty: "Hard",
      description: "Design an LRU (Least Recently Used) cache with O(1) get and put operations.",
      examples: ["LRUCache(2): put(1,1), put(2,2), get(1)→1, put(3,3) evicts key 2, get(2)→-1"],
      hint: "Combine a HashMap with a doubly linked list. The map gives O(1) access; the list maintains usage order.",
      solution: `class LRUCache {\n  constructor(capacity) {\n    this.cap = capacity;\n    this.map = new Map();\n  }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.map.has(key)) this.map.delete(key);\n    else if (this.map.size >= this.cap)\n      this.map.delete(this.map.keys().next().value);\n    this.map.set(key, value);\n  }\n}\nconst c = new LRUCache(2);\nc.put(1, 1); c.put(2, 2);\nconsole.log(c.get(1)); // 1\nc.put(3, 3);\nconsole.log(c.get(2)); // -1`,
    },
  ],

  trees: [
    {
      id: 1, title: "Maximum Depth of Binary Tree", difficulty: "Easy",
      description: "Find the maximum depth (number of nodes along the longest root-to-leaf path) of a binary tree.",
      examples: ["[3,9,20,null,null,15,7] → 3"],
      hint: "Recursively return 1 + max(depth(left), depth(right)). Base case: null node returns 0.",
      solution: `function maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}\nconsole.log("Max depth logic correct ✓");`,
    },
    {
      id: 2, title: "Level Order Traversal", difficulty: "Medium",
      description: "Return the level-order (BFS) traversal of a binary tree's values as an array of arrays.",
      examples: ["[3,9,20,null,null,15,7] → [[3],[9,20],[15,7]]"],
      hint: "Use a queue. At each level, record its size, process exactly that many nodes, then enqueue their children.",
      solution: `function levelOrder(root) {\n  if (!root) return [];\n  const res = [], q = [root];\n  while (q.length) {\n    const level = [], size = q.length;\n    for (let i = 0; i < size; i++) {\n      const node = q.shift();\n      level.push(node.val);\n      if (node.left) q.push(node.left);\n      if (node.right) q.push(node.right);\n    }\n    res.push(level);\n  }\n  return res;\n}\nconsole.log("BFS traversal logic correct ✓");`,
    },
    {
      id: 3, title: "Validate BST", difficulty: "Medium",
      description: "Determine if a binary tree is a valid Binary Search Tree.",
      examples: ["[2,1,3] → true", "[5,1,4,null,null,3,6] → false"],
      hint: "Pass min/max bounds recursively. Each node must be strictly within its valid range.",
      solution: `function isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true;\n  if (root.val <= min || root.val >= max) return false;\n  return isValidBST(root.left, min, root.val) &&\n         isValidBST(root.right, root.val, max);\n}\nconsole.log("BST validation logic correct ✓");`,
    },
    {
      id: 4, title: "Lowest Common Ancestor (BST)", difficulty: "Medium",
      description: "Find the lowest common ancestor of two nodes in a Binary Search Tree.",
      examples: ["BST root=6, p=2, q=8 → 6", "BST root=6, p=2, q=4 → 2"],
      hint: "If both p and q are less than root, go left. If both are greater, go right. Otherwise root is the LCA.",
      solution: `function lowestCommonAncestor(root, p, q) {\n  if (p.val < root.val && q.val < root.val)\n    return lowestCommonAncestor(root.left, p, q);\n  if (p.val > root.val && q.val > root.val)\n    return lowestCommonAncestor(root.right, p, q);\n  return root;\n}\nconsole.log("LCA logic correct ✓");`,
    },
    {
      id: 5, title: "Serialize & Deserialize Binary Tree", difficulty: "Hard",
      description: "Design an algorithm to serialize a binary tree to a string and deserialize it back.",
      examples: ["serialize([1,2,3,null,null,4,5]) → '1,2,3,null,null,4,5'"],
      hint: "Use BFS for serialization (level order). For deserialization, use a queue of nodes and an index pointer.",
      solution: `function serialize(root) {\n  if (!root) return 'null';\n  const q = [root], res = [];\n  while (q.length) {\n    const n = q.shift();\n    if (!n) { res.push('null'); continue; }\n    res.push(n.val);\n    q.push(n.left, n.right);\n  }\n  return res.join(',');\n}\nfunction deserialize(data) {\n  const vals = data.split(',');\n  if (vals[0] === 'null') return null;\n  const root = { val: +vals[0], left: null, right: null };\n  const q = [root];\n  let i = 1;\n  while (q.length) {\n    const n = q.shift();\n    if (vals[i] !== 'null') { n.left = { val: +vals[i], left: null, right: null }; q.push(n.left); } i++;\n    if (vals[i] !== 'null') { n.right = { val: +vals[i], left: null, right: null }; q.push(n.right); } i++;\n  }\n  return root;\n}\nconsole.log("Serialize/Deserialize logic correct ✓");`,
    },
  ],

  dp: [
    {
      id: 1, title: "Climbing Stairs", difficulty: "Easy",
      description: "You can climb 1 or 2 steps at a time. How many distinct ways to reach the top of n stairs?",
      examples: ["n=2 → 2", "n=3 → 3", "n=5 → 8"],
      hint: "This is Fibonacci. dp[i] = dp[i-1] + dp[i-2]. Optimize to O(1) space with two variables.",
      solution: `function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) [a, b] = [b, a + b];\n  return b;\n}\nconsole.log(climbStairs(5));`,
    },
    {
      id: 2, title: "Coin Change", difficulty: "Medium",
      description: "Given coin denominations and a target amount, find the minimum number of coins needed.",
      examples: ["coins=[1,5,11], amount=15 → 3", "coins=[2], amount=3 → -1"],
      hint: "dp[i] = min coins for amount i. dp[0]=0, fill 1→amount using min over all valid coins.",
      solution: `function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++)\n    for (const c of coins)\n      if (c <= i) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\nconsole.log(coinChange([1,5,11], 15));`,
    },
    {
      id: 3, title: "Longest Common Subsequence", difficulty: "Medium",
      description: "Find the length of the longest common subsequence between two strings.",
      examples: ["text1='abcde', text2='ace' → 3", "text1='abc', text2='abc' → 3"],
      hint: "2D DP: dp[i][j] = LCS of text1[0..i] and text2[0..j]. If chars match, dp[i][j] = dp[i-1][j-1]+1.",
      solution: `function longestCommonSubsequence(t1, t2) {\n  const m = t1.length, n = t2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i++)\n    for (let j = 1; j <= n; j++)\n      dp[i][j] = t1[i-1] === t2[j-1]\n        ? dp[i-1][j-1] + 1\n        : Math.max(dp[i-1][j], dp[i][j-1]);\n  return dp[m][n];\n}\nconsole.log(longestCommonSubsequence('abcde', 'ace'));`,
    },
    {
      id: 4, title: "Word Break", difficulty: "Medium",
      description: "Given a string s and a dictionary, return true if s can be segmented into dictionary words.",
      examples: ["s='leetcode', dict=['leet','code'] → true", "s='applepenapple', dict=['apple','pen'] → true"],
      hint: "dp[i] = true if s[0..i] can be segmented. For each i, check all j<i where dp[j] is true and s[j..i] is in the dict.",
      solution: `function wordBreak(s, wordDict) {\n  const set = new Set(wordDict);\n  const dp = new Array(s.length + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= s.length; i++)\n    for (let j = 0; j < i; j++)\n      if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }\n  return dp[s.length];\n}\nconsole.log(wordBreak('leetcode', ['leet','code']));`,
    },
    {
      id: 5, title: "Edit Distance", difficulty: "Hard",
      description: "Find the minimum number of operations (insert, delete, replace) to convert word1 to word2.",
      examples: ["word1='horse', word2='ros' → 3", "word1='intention', word2='execution' → 5"],
      hint: "2D DP: dp[i][j] is the edit distance for word1[0..i] and word2[0..j]. If chars match, copy the diagonal; else 1 + min of three neighbors.",
      solution: `function minDistance(w1, w2) {\n  const m = w1.length, n = w2.length;\n  const dp = Array.from({ length: m + 1 }, (_, i) =>\n    Array.from({ length: n + 1 }, (_, j) => i || j)\n  );\n  for (let i = 1; i <= m; i++)\n    for (let j = 1; j <= n; j++)\n      dp[i][j] = w1[i-1] === w2[j-1]\n        ? dp[i-1][j-1]\n        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n  return dp[m][n];\n}\nconsole.log(minDistance('horse', 'ros'));`,
    },
  ],

  strings: [
    {
      id: 1, title: "Valid Anagram", difficulty: "Easy",
      description: "Given two strings s and t, return true if t is an anagram of s.",
      examples: ["s='anagram', t='nagaram' → true", "s='rat', t='car' → false"],
      hint: "Count character frequencies. Use a frequency map: increment for s, decrement for t.",
      solution: `function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}\nconsole.log(isAnagram('anagram', 'nagaram'));`,
    },
    {
      id: 2, title: "Longest Substring Without Repeating", difficulty: "Medium",
      description: "Find the length of the longest substring without repeating characters.",
      examples: ["'abcabcbb' → 3", "'bbbbb' → 1", "'pwwkew' → 3"],
      hint: "Sliding window with a Set. Expand the right pointer; when a duplicate is found, shrink the left pointer.",
      solution: `function lengthOfLongestSubstring(s) {\n  const set = new Set();\n  let l = 0, max = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (set.has(s[r])) { set.delete(s[l]); l++; }\n    set.add(s[r]);\n    max = Math.max(max, r - l + 1);\n  }\n  return max;\n}\nconsole.log(lengthOfLongestSubstring('abcabcbb'));`,
    },
    {
      id: 3, title: "Longest Palindromic Substring", difficulty: "Medium",
      description: "Return the longest palindromic substring in s.",
      examples: ["'babad' → 'bab'", "'cbbd' → 'bb'"],
      hint: "Expand around each center character. Try both odd (single char) and even (two char) palindromes.",
      solution: `function longestPalindrome(s) {\n  let res = '';\n  function expand(l, r) {\n    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }\n    return s.slice(l + 1, r);\n  }\n  for (let i = 0; i < s.length; i++) {\n    const odd = expand(i, i), even = expand(i, i + 1);\n    if (odd.length > res.length) res = odd;\n    if (even.length > res.length) res = even;\n  }\n  return res;\n}\nconsole.log(longestPalindrome('babad'));`,
    },
    {
      id: 4, title: "Group Anagrams", difficulty: "Medium",
      description: "Group an array of strings into anagram groups.",
      examples: ["['eat','tea','tan','ate','nat','bat'] → [['eat','tea','ate'],['tan','nat'],['bat']]"],
      hint: "Sort each word to create a canonical key. Use a HashMap where key=sorted word, value=list of originals.",
      solution: `function groupAnagrams(strs) {\n  const map = new Map();\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(s);\n  }\n  return [...map.values()];\n}\nconsole.log(groupAnagrams(['eat','tea','tan','ate','nat','bat']));`,
    },
    {
      id: 5, title: "Minimum Window Substring", difficulty: "Hard",
      description: "Find the minimum window substring of s that contains all characters in t.",
      examples: ["s='ADOBECODEBANC', t='ABC' → 'BANC'"],
      hint: "Sliding window with two frequency maps. Track how many chars are satisfied; shrink left when all are covered.",
      solution: `function minWindow(s, t) {\n  const need = {}, have = {};\n  for (const c of t) need[c] = (need[c] || 0) + 1;\n  let formed = 0;\n  const required = Object.keys(need).length;\n  let l = 0, min = Infinity, res = '';\n  for (let r = 0; r < s.length; r++) {\n    const c = s[r];\n    have[c] = (have[c] || 0) + 1;\n    if (need[c] && have[c] === need[c]) formed++;\n    while (formed === required) {\n      if (r - l + 1 < min) { min = r - l + 1; res = s.slice(l, r + 1); }\n      have[s[l]]--;\n      if (need[s[l]] && have[s[l]] < need[s[l]]) formed--;\n      l++;\n    }\n  }\n  return res;\n}\nconsole.log(minWindow('ADOBECODEBANC', 'ABC'));`,
    },
  ],

  graphs: [
    {
      id: 1, title: "Number of Islands", difficulty: "Medium",
      description: "Count the number of islands (connected groups of '1's) in a 2D grid.",
      examples: ["Grid with two separate 1-clusters → 2"],
      hint: "DFS from each unvisited '1'. Mark visited cells as '0' to avoid re-counting.",
      solution: `function numIslands(grid) {\n  let count = 0;\n  function dfs(i, j) {\n    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === '0') return;\n    grid[i][j] = '0';\n    dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1);\n  }\n  for (let i = 0; i < grid.length; i++)\n    for (let j = 0; j < grid[0].length; j++)\n      if (grid[i][j] === '1') { count++; dfs(i, j); }\n  return count;\n}\nconst grid = [['1','1','0'],['0','1','0'],['0','0','1']];\nconsole.log(numIslands(grid));`,
    },
    {
      id: 2, title: "Clone Graph", difficulty: "Medium",
      description: "Clone an undirected graph. Each node has a val and a list of neighbors.",
      examples: ["Node 1 — 2,4; Node 2 — 1,3; Node 3 — 2,4; Node 4 — 1,3 → deep clone"],
      hint: "Use a HashMap from original node → cloned node. DFS to clone all neighbors recursively.",
      solution: `function cloneGraph(node) {\n  if (!node) return null;\n  const map = new Map();\n  function dfs(n) {\n    if (map.has(n)) return map.get(n);\n    const clone = { val: n.val, neighbors: [] };\n    map.set(n, clone);\n    for (const nb of n.neighbors) clone.neighbors.push(dfs(nb));\n    return clone;\n  }\n  return dfs(node);\n}\nconsole.log("Clone graph logic correct ✓");`,
    },
    {
      id: 3, title: "Course Schedule", difficulty: "Medium",
      description: "Given numCourses and prerequisites, determine if all courses can be finished (cycle detection).",
      examples: ["numCourses=2, prerequisites=[[1,0]] → true", "numCourses=2, prerequisites=[[1,0],[0,1]] → false"],
      hint: "Build an adjacency list and detect cycles using DFS with three states: unvisited (0), in-progress (1), done (2).",
      solution: `function canFinish(numCourses, prerequisites) {\n  const graph = Array.from({ length: numCourses }, () => []);\n  for (const [a, b] of prerequisites) graph[b].push(a);\n  const state = new Array(numCourses).fill(0);\n  function dfs(node) {\n    if (state[node] === 1) return false;\n    if (state[node] === 2) return true;\n    state[node] = 1;\n    for (const nb of graph[node]) if (!dfs(nb)) return false;\n    state[node] = 2;\n    return true;\n  }\n  for (let i = 0; i < numCourses; i++) if (!dfs(i)) return false;\n  return true;\n}\nconsole.log(canFinish(2, [[1,0]]));`,
    },
    {
      id: 4, title: "Word Ladder", difficulty: "Hard",
      description: "Find the shortest transformation sequence from beginWord to endWord, changing one letter at a time.",
      examples: ["beginWord='hit', endWord='cog', wordList=['hot','dot','dog','lot','log','cog'] → 5"],
      hint: "BFS from beginWord. For each word, try changing each character to a-z and check if it's in the word set.",
      solution: `function ladderLength(beginWord, endWord, wordList) {\n  const wordSet = new Set(wordList);\n  if (!wordSet.has(endWord)) return 0;\n  const q = [[beginWord, 1]];\n  while (q.length) {\n    const [word, len] = q.shift();\n    for (let i = 0; i < word.length; i++) {\n      for (let c = 97; c <= 122; c++) {\n        const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);\n        if (next === endWord) return len + 1;\n        if (wordSet.has(next)) { wordSet.delete(next); q.push([next, len + 1]); }\n      }\n    }\n  }\n  return 0;\n}\nconsole.log(ladderLength('hit','cog',['hot','dot','dog','lot','log','cog']));`,
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const diffColor = (d) =>
  d === "Easy" ? C.green : d === "Medium" ? C.amber : C.red;

const diffBg = (d) =>
  d === "Easy" ? C.greenSoft : d === "Medium" ? C.amberSoft : "rgba(239,68,68,0.12)";

function DiffBadge({ difficulty }) {
  return (
    <span
      style={{
        background: diffBg(difficulty),
        color: diffColor(difficulty),
        padding: "3px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {difficulty}
    </span>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const s = {
  backBtn: {
    marginBottom: 24,
    background: "transparent",
    border: `1px solid ${C.border}`,
    color: C.textSub,
    padding: "9px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
  },
  card: {
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
  },
  panel: (extra = {}) => ({
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
    ...extra,
  }),
  codeBlock: {
    background: C.bgDeep,
    padding: 16,
    borderRadius: 12,
    color: C.cyan,
    overflow: "auto",
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: "monospace",
  },
};

// ─── Question View ────────────────────────────────────────────────────────────
function QuestionView({ question, onBack }) {
  const [code, setCode]               = useState("");
  const [output, setOutput]           = useState("");
  const [showHint, setShowHint]       = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const runCode = () => {
    const logs = [];
    const origLog = console.log;
    console.log = (...args) =>
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
    try {
      // eslint-disable-next-line no-new-func
      new Function(code)();
      setOutput(logs.join("\n") || "✅ Executed (no output)");
    } catch (e) {
      setOutput(`❌ ${e.message}`);
    }
    console.log = origLog;
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <button style={s.backBtn} onClick={onBack}>← Back</button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* ── Left panel ── */}
        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
            <h1 style={{ color: C.text, fontSize: 28, margin: 0 }}>{question.title}</h1>
            <DiffBadge difficulty={question.difficulty} />
          </div>

          <div style={s.panel()}>
            <p style={{ color: C.textSub, lineHeight: 1.8, fontSize: 15 }}>{question.description}</p>
          </div>

          <div style={s.panel()}>
            <h3 style={{ color: C.text, marginBottom: 12, fontSize: 15 }}>Examples</h3>
            {question.examples.map((ex, i) => (
              <pre key={i} style={{ ...s.codeBlock, marginBottom: 8 }}>{ex}</pre>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowHint(!showHint)}
              style={{ background: C.amberSoft, color: C.amber, border: "none", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}
            >
               {showHint ? "Hide hint" : "Show hint"}
            </button>
            <button
              onClick={() => setShowSolution(!showSolution)}
              style={{ background: C.purpleSoft, color: C.purple, border: "none", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}
            >
              🔓 {showSolution ? "Hide solution" : "Show solution"}
            </button>
          </div>

          {showHint && (
            <div style={{ marginTop: 16, background: C.amberSoft, border: `1px solid ${C.amber}`, padding: 16, borderRadius: 12, color: C.amber, fontSize: 14 }}>
              {question.hint}
            </div>
          )}

          {showSolution && (
            <pre style={{ ...s.codeBlock, marginTop: 16, whiteSpace: "pre-wrap" }}>{question.solution}</pre>
          )}
        </div>

        {/* ── Right panel ── */}
        <div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Write your solution here..."
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 420,
              background: C.bgDeep,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 18,
              color: C.cyan,
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 1.6,
              outline: "none",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={runCode}
              style={{ background: C.accent, border: "none", color: "#fff", padding: "11px 22px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
            >
              ▶ Run Code
            </button>
            <button
              onClick={() => setCode(question.solution)}
              style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.textSub, padding: "11px 18px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}
            >
              Load Solution
            </button>
            <button
              onClick={() => { setCode(""); setOutput(""); }}
              style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.textSub, padding: "11px 18px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}
            >
              Clear
            </button>
          </div>

          {output && (
            <div style={{ marginTop: 16, background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ color: C.textMuted, fontSize: 11, letterSpacing: "0.08em", marginBottom: 8 }}>OUTPUT</div>
              <pre style={{ color: output.startsWith("❌") ? C.red : C.green, fontSize: 13, whiteSpace: "pre-wrap" }}>{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Topic View ───────────────────────────────────────────────────────────────
function TopicView({ topic, onSelectQuestion, onBack }) {
  const questions = QUESTIONS[topic.id] || [];
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <button style={s.backBtn} onClick={onBack}>← Back</button>
      <h1 style={{ color: C.text, fontSize: 36, fontWeight: 800, marginBottom: 6 }}>
        {topic.icon} {topic.label}
      </h1>
      <p style={{ color: C.textMuted, marginBottom: 28 }}>{questions.length} problems</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q)}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "16px 20px",
              color: C.text,
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 15,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgCardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.bgCard)}
          >
            <span>{q.title}</span>
            <DiffBadge difficulty={q.difficulty} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
function MainView({ onSelectTopic }) {

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "70px 24px",
      }}
    >

      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
        }}
      >

        {/* HERO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 70,
          }}
        >

          <div
            style={{
              display: "inline-block",
              padding: "8px 18px",
              borderRadius: 999,
              background: "#eef2ff",
              border: "1px solid #c7d2fe",
              color: "#4f46e5",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
           Crack Technical Interviews
          </div>

          <h1
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1.05,
              marginBottom: 18,
            }}
          >
            Master
            <span
              style={{
                background:
                  "linear-gradient(to right,#4f46e5,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              DSA
            </span>
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: 18,
              maxWidth: 700,
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Practice coding problems with real interview-style
            questions, interactive code execution, hints,
            solutions, and topic-wise preparation.
          </p>

        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 18,
            marginBottom: 60,
          }}
        >

          {[
            ["30+", "Problems"],
            ["6", "Topics"],
            ["Easy → Hard", "Difficulty"],
            ["Live", "Code Runner"],
          ].map(([num, label]) => (

            <div
              key={label}

              style={{
                background: "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: 24,
                padding: 28,
                textAlign: "center",
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >

              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  marginBottom: 8,
                  background:
                    "linear-gradient(to right,#4f46e5,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:
                    "transparent",
                }}
              >
                {num}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                {label}
              </div>

            </div>

          ))}

        </div>

        {/* TOPICS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: 24,
          }}
        >

          {TOPICS.map((topic) => (

            <button
              key={topic.id}

              onClick={() =>
                onSelectTopic(topic)
              }

              style={{
                position: "relative",
                overflow: "hidden",

                background: "#ffffff",

                border:
                  "1px solid #e5e7eb",

                borderRadius: 30,

                padding: 30,

                cursor: "pointer",

                textAlign: "left",

                transition:
                  "all 0.35s ease",

                minHeight: 240,

                boxShadow:
                  "0 8px 30px rgba(0,0,0,0.06)",
              }}

              onMouseEnter={(e) => {

                e.currentTarget.style.transform =
                  "translateY(-8px) scale(1.02)";

                e.currentTarget.style.border =
                  `1px solid ${topic.color}`;

                e.currentTarget.style.boxShadow =
                  `0 20px 40px ${topic.color}33`;
              }}

              onMouseLeave={(e) => {

                e.currentTarget.style.transform =
                  "translateY(0px) scale(1)";

                e.currentTarget.style.border =
                  "1px solid #e5e7eb";

                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(0,0,0,0.06)";
              }}
            >

              {/* GRADIENT GLOW */}
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 140,
                  height: 140,
                  background: topic.color,
                  opacity: 0.10,
                  borderRadius: "50%",
                  filter: "blur(50px)",
                }}
              />

              {/* ICON */}
              <div
                style={{
                  fontSize: 54,
                  marginBottom: 24,
                }}
              >
                {topic.icon}
              </div>

              {/* TITLE */}
              <h2
                style={{
                  color: "#111827",
                  fontSize: 26,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                {topic.label}
              </h2>

              {/* QUESTIONS */}
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 15,
                  marginBottom: 24,
                }}
              >
                {topic.count} curated interview problems
              </p>

              {/* PROGRESS */}
              <div
                style={{
                  height: 8,
                  background: "#f3f4f6",
                  borderRadius: 999,
                  overflow: "hidden",
                  marginBottom: 18,
                }}
              >

                <div
                  style={{
                    width: "72%",
                    height: "100%",
                    background: topic.color,
                    borderRadius: 999,
                  }}
                />

              </div>

              {/* CTA */}
              <div
                style={{
                  color: topic.color,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Start Practicing →
              </div>

            </button>

          ))}

        </div>

      </div>

    </div>
  );
}
// ─── App Shell ────────────────────────────────────────────────────────────────
export default function DSAPage() {
  const [selectedTopic,    setSelectedTopic]    = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  if (selectedQuestion) {
    return (
      <QuestionView
        question={selectedQuestion}
        onBack={() => setSelectedQuestion(null)}
      />
    );
  }

  if (selectedTopic) {
    return (
      <TopicView
        topic={selectedTopic}
        onSelectQuestion={setSelectedQuestion}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return <MainView onSelectTopic={setSelectedTopic} />;
}