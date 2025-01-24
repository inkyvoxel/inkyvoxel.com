---
title: How to use Python sets
description: Python sets are useful for creating collections of unique elements. They support operations such as finding the difference between two sets, joining multiple sets together, and more!
tags:
  - software-engineering
---

Sets are data structures used for holding unique collections of elements. Meaning, you cannot have duplicate elements in a set.

## Creating sets

You can created a set using Python's `set()` function.

```python
# create a unique collection of letters from 'hello'
unique_letters = set("hello")

print(unique_letters)
```

**Output:** `{'o', 'h', 'e', 'l'}`

Notice that the duplicate `l` in `hello` was not added to the set.

The order of the output looks a little funky. This is because sets are unordered collections.

The output is also wrapped with curly braces, which can also be used for creating sets.

You can create a set from an existing list by passing the list into the `set()` function.

```python
# a list with duplicate numbers
numbers = [1, 1, 1, 2, 3, 4]

# make a set from the list
unique_numbers = set(numbers)

print(unique_numbers)
```

**Output:** `{1, 2, 3, 4}`

You can add or remove elements, and check the length of a set.

```python
numbers = {1, 2, 3, 4}

numbers.add(5)

numbers.remove(5)

print(len(numbers))
```

**Output:** `4`

## Set operations

You can join two sets together, which will remove any duplicate elements.

```python
first = {1, 2, 3, 4}
second = {3, 4, 5, 6}

# use '|' to get the union of two sets
print(first | second)
```

**Output:** `{1, 2, 3, 4, 5, 6}`

You can find the elements that exist in two sets.

```python
first = {1, 2, 3, 4}
second = {3, 4, 5, 6}

# use '&' to get elements that exist in both sets
print(first & second)
```

**Output:** `{3, 4}`

You can find elements that exist in one set, but not the other.

```python
first = {1, 2, 3, 4}
second = {3, 4, 5, 6}

# use '-' to get elements that exist in the first set
# but not the second set
print(first - second)
```

**Output:** `{1, 2}`

You could find the reverse by simply switching the sets around.

```python
first = {1, 2, 3, 4}
second = {3, 4, 5, 6}

# use '-' to get elements that exist in the second set
# but not the first set
print(second - first)
```

**Output:** `{5, 6}`

You can also find elements that exist in both first and second sets, but do not exist in both.

```python
first = {1, 2, 3, 4}
second = {3, 4, 5, 6}

# use '^' to find elements that exist in
# first and second set, but not in both
print(first ^ second)
```

**Output:** `{1, 2, 5, 6}`

You can use the above operations with multiple sets.

```python
first = {1, 2, 3, 4}
second = {3, 4, 5, 6}
third = {5, 6, 7, 8}
forth = {7, 8, 9, 10}

# union of 4 sets
print(first | second | third | forth)
```

**Output:** `{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}`

## Accessing elements in sets

It is important to know that sets do not support indexes. If you try to find an element inside a set using an index, you will get an error.

```python
numbers = {1, 2, 3, 4}

print(numbers[0])
```

**Output:** `TypeError: 'set' object is not subscriptable` 💥

However, you can loop through elements using a `for` loop.

```python
numbers = {1, 2, 3, 4}

for number in numbers:
    print(number)
```

**Output:** `1`, `2`, `3`, `4`

You can also check for the existing of an element using the `in` keyword.

```python
numbers = {1, 2, 3, 4}

if 1 in numbers:
    print(True)
else:
    print(False)
```

**Output:** `True`

## Closing thoughts

Next time you need uniqueness in your data structures, don't use a list with a bunch of loops and conditional statements, use a set instead!
