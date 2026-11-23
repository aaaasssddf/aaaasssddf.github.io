---
title: MIPS学习笔记（番外篇）：实用宏合集
date: 2026-11-21 20:04:34
tags:
- MIPS
- 计硬
categories: 
- 计算机硬件基础
---
# 写在前面
计硬的p2上机允许携带纸质材料，不允许使用自己的电脑或者带电子资料，这里存了一些有用的宏，可以打印出来上机的时候复现。多用宏实现一些可复用的功能可以提高程序可读性，降低debug难度。
# 结束程序与输入输出
## 结束程序
```mipsasm
.macro EXIT()
    li $v0, 10
    syscall
.end_macro
```
## 整数输入
`%i`是目标寄存器
```mipsasm
.macro READI(%i)
    li $v0, 5
    syscall
    move %i, $v0
.end_macro 
```
## 整数输出
`%i`是输出整数位于的寄存器
```mipsasm
.macro PRINTI(%i)
    move $a0, %i
    li $v0, 1
    syscall
.end_macro 
```
## 字符串输入
`%buffer`是预留空间的标签，`%cap`表示字符串大小（存在寄存器），最多读入`%cap - 1`个字节，最后一字节是`\0`
```mipsasm
.macro READS(%buffer, %cap)
    la $a0, %buffer
    move $a1, %cap #如果要用立即数表示容量，则把这行换成li
    li $v0, 8
    syscall
.end_macro
```
## 字符串输出
`%str`是输出的字符串的标签
```mipsasm
.macro PRINTS(%str)
    la $a0, %str
    li $v0, 4
    syscall
.end_macro
```
# 数组与字符串读取
## 读取数组某项
`%dest`是目标寄存器位置，`%index`是下标（从0开始），`%arr`是数组
```mipsasm
.macro LOAD_ARR(%dest, %index, %arr)
    la $t8, %arr
    sll $t9, %index, 2
    addu $t8, $t8, $t9
    lw %dest, 0($t8)
.end_macro
```
## 写入数组某项
`%src`是源寄存器位置，`%index`是下标（从0开始），`%arr`是数组
```mipsasm
.macro STORE_ARR(%src, %index, %arr)
    la   $t8, %arr
    sll  $t9, %index, 2
    addu $t8, $t8, $t9
    sw   %src, 0($t8)
.end_macro
```
## 读取字符串某项
`%dest`是目标寄存器位置，`%index`是下标（从0开始），`%arr`是字符串
```mipsasm
.macro LOAD_STRC(%dest, %index, %str)
    la $t9, %str
    addu $t8, $t9, %index
    lbu  %dest, 0($t8)
.end_macro
```
## 写入字符串某项
`%src`是源寄存器位置，`%index`是下标（从0开始），`%arr`是字符串
```mipsasm
.macro STOREC(%src, %index, %str)
    la $t9, %str
    addu $t8, $t9, %index
    sb  %src, 0($t8)
.end_macro
```
# 其它
## 两数最小值
`%dst`是返回值寄存器，`%a`、`%b`表示两个数的寄存器。按有符号整数比较
```mipsasm 
.macro MIN(%dst, %a, %b)
    move  $t8, %a
    move  $t9, %b
    ble   $t8, $t9, min_done
    move  $t8, $t9
min_done:
    move  %dst, $t8
.end_macro
```
## 两数最大值
同上
```mipsasm
.macro MAX(%dst, %a, %b)
    move  $t8, %a
    move  $t9, %b
    bge   $t8, $t9, max_done
    move  $t8, $t9
max_done:
    move  %dst, $t8
.end_macro
```

## 判断质数
`%dst`是返回值的目标寄存器，为0表示非质数，为1表示质数。`%n`是数
```mipsasm
.macro IS_PRIME(%dst, %n)
    move  $t8, %n
    li    $t7, 0
    blt   $t8, 2, prime_done
    beq   $t8, 2, prime_yes
    andi  $t6, $t8, 1
    beqz  $t6, prime_done    # 排除大于2的偶数
    li    $t9, 3            # 从3开始，只检查奇数因子
prime_loop:
    divu  $t8, $t9
    mflo  $t6
    bgt   $t9, $t6, prime_yes # i > n/i，避免i*i溢出
    mfhi  $t6
    beqz  $t6, prime_done
    addiu $t9, $t9, 2
    j     prime_loop
prime_yes:
    li    $t7, 1
prime_done:
    move  %dst, $t7
.end_macro
```
## 最大公约数
`%dst`是返回值寄存器，`%a`、`%b`表示两个数的寄存器
```mipsasm
.macro GCD(%dst, %a, %b)
    move  $t8, %a
    move  $t9, %b
gcd_loop:
    beqz  $t9, gcd_done
    divu  $t8, $t9
    mfhi  $t6             # 余数r
    move  $t8, $t9        # a = b
    move  $t9, $t6        # b = r
    j     gcd_loop
gcd_done:
    move  %dst, $t8
.end_macro
```