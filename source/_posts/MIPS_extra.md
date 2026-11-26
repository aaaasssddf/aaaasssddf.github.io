---
title: MIPS学习笔记（番外篇）：实用宏合集
date: 2026-11-21 20:04:34
tags:
- MIPS汇编
- 计硬
categories: 
- 计算机硬件基础
order: 4
cover: "/assets/cover/4.png"
excerpt: "汇总可复用的 MIPS 宏，涵盖程序退出、整数与字符串输入输出、数组元素与字符读写，以及求最值、判断质数和求最大公约数。各示例附有参数说明，方便上机时查阅。"
---
# 写在前面
计硬的p2上机允许携带纸质材料，不允许使用自己的电脑或者带电子资料，这里存了一些有用的宏，可以打印出来上机的时候复现。多用宏实现一些可复用的功能可以提高程序可读性，降低debug难度。以下这些宏会占用`$t6 ~ $t9`寄存器，使用时不要在这几个寄存器存数据以防被覆盖。部分宏由ai生成。
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
`%buffer`是预留空间的标签，`%cap`表示缓冲区容量（存在寄存器），最多读入`%cap - 1`个字节，最后一字节是`\0`
```mipsasm
.macro READS(%buffer, %cap)
    move $a1, %cap #如果要用立即数表示容量，则把这行换成li
    la $a0, %buffer
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
## 数组初始化
```mipsasm
```mipsasm
.macro FILL_ARR(%arr, %n, %value)
    la    $t8, %arr
    move  $t9, %n
    move  $t7, %value
    blez  $t9, fill_done
fill_loop:
    sw    $t7, 0($t8)
    addiu $t8, $t8, 4
    addiu $t9, $t9, -1
    bnez  $t9, fill_loop
fill_done:
.end_macro
```
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
## 数组求和
```mipsasm
```mipsasm
.macro SUM_ARR(%dst, %arr, %n)
    la    $t8, %arr
    move  $t9, %n
    li    $t7, 0
    blez  $t9, sum_done
sum_loop:
    lw    $t6, 0($t8)
    addu  $t7, $t7, $t6
    addiu $t8, $t8, 4
    addiu $t9, $t9, -1
    bnez  $t9, sum_loop
sum_done:
    move  %dst, $t7
.end_macro
```
## 字符串长度
```mipsasm
.macro STRLEN(%dst, %str)
    la    $t8, %str
    li    $t7, 0
len_loop:
    lbu   $t6, 0($t8)
    beqz  $t6, len_done
    addiu $t7, $t7, 1
    addiu $t8, $t8, 1
    j     len_loop
len_done:
    move  %dst, $t7
.end_macro
```
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
`%dst`是返回值寄存器，`%a`、`%b`表示两个数的寄存器，要求非负
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
## 冒泡排序
```mipsasm
.macro SORT_ARR(%arr, %n)
    ble   %n, 1, sort_done   # 0或1个元素，不用排序
    la    $t8, %arr
    sll   $t9, %n, 2
    addu  $t9, $t8, $t9
    addiu $t9, $t9, -4       # 本轮最后一个待排序元素的地址
sort_outer:
    la    $t8, %arr           # 每轮从数组开头比较
    bgeu  $t8, $t9, sort_done
sort_inner:
    lw    $t6, 0($t8)         # 当前元素
    lw    $t7, 4($t8)         # 后一个元素
    ble   $t6, $t7, sort_next # 已满足升序，不交换
    sw    $t7, 0($t8)         # 交换相邻元素
    sw    $t6, 4($t8)
sort_next:
    addiu $t8, $t8, 4
    bltu  $t8, $t9, sort_inner
    addiu $t9, $t9, -4        # 最大值归位，缩小排序范围
    j     sort_outer

sort_done:
.end_macro
```
## 二分查找
```mipsasm
# dst = 在arr[first..last)中查找value
# 找到返回匹配下标；找不到返回last
.macro STL_BINARY_SEARCH(%dst, %arr, %first, %last, %value)
    move  $t6, %first
    move  $t7, %last

bs_loop:
    bge   $t6, $t7, bs_not_found
    subu  $t8, $t7, $t6
    srl   $t8, $t8, 1
    addu  $t8, $t6, $t8      # mid = left + (right-left)/2

    sll   $t9, $t8, 2
    lw    $t9, %arr($t9)     # arr[mid]

    beq   $t9, %value, bs_found
    blt   $t9, %value, bs_right
    move  $t7, $t8
    j     bs_loop

bs_right:
    addiu $t6, $t8, 1
    j     bs_loop

bs_found:
    move  %dst, $t8
    j     bs_done

bs_not_found:
    move  %dst, %last

bs_done:
.end_macro
```
## 数组区间反转
```mipsasm
# 原地反转arr[first..last)
.macro STL_REVERSE(%arr, %first, %last)
    move  $t6, %first
    move  $t7, %last
    bge   $t6, $t7, rev_done

    sll   $t6, $t6, 2
    sll   $t7, $t7, 2
    la    $t8, %arr
    addu  $t6, $t8, $t6      # 左侧元素地址
    addu  $t7, $t8, $t7
    addiu $t7, $t7, -4       # 右侧元素地址

rev_loop:
    bgeu  $t6, $t7, rev_done

    lw    $t8, 0($t6)
    lw    $t9, 0($t7)
    sw    $t9, 0($t6)
    sw    $t8, 0($t7)

    addiu $t6, $t6, 4
    addiu $t7, $t7, -4
    j     rev_loop

rev_done:
.end_macro
```