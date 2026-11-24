---
title: MIPS学习笔记（2）：流程控制、数组和字符串
toc: true
date: 2026-11-24 00:09:07
tags:
categories:
  - 计算机硬件基础
tags:
  - MIPS汇编
  - 计硬
---

# 流程控制
## 条件判断
### if-else及其嵌套
我们可以使用条件分支指令来实现if-else
```mipsasm
bgt $a, $b, label
# else

label:
# if
```
相当于高级语言中的这样一段代码：
```cpp
if (a > b) {
// if
} else {
// else
}
```
注意到，在MIPS，在条件分支语句后面跟着的是“不满足条件的”，在跳转的目标标签后面的反而是“满足条件的”。这一点与高级语言中不同。你可以灵活地使用各种条件分支语句来书写条件。如果要实现if-else-else:
```cpp
if (a > b) {
// do A
} else if (a == b) {
// do B
} else {
// do C
}
```
就可以将其是做一个if-else里面再嵌套一个if-else:
```cpp
if (a > b) {
// do A
} else {
    if (a == b) {
    // do B
    } else {
    // do C
    }
}
```
在MIPS中：
```mipsasm
bgt $a, $b, do_A
beq $a, $b, do_B
j do_C # C也可以直接在这下面写

do_A:
# do A

do_B:
# do B

do_C:
# do C
```
### 条件的与和或
在MIPS中，我们没有办法自定义条件分支指令，所以就无法将条件的与、或判断在同一个语句里实现。我们可以将条件的与或视为if-else的嵌套。
#### 条件的或
```cpp
if (conditionA || conditionB) {
// do A
} else {
// do B
}
```
改写：
```cpp
if (conditionA) {
// do A
} else {
    if(conditionB) {
    // do A
    } else {
    // do B
    }
}
```
（其实前文那个判断`a > b`和`a = b`的例子将跳转分支合并一下就是一个条件的或的例子）。现在写`if((a > b) || (a == b))`:
```mipsasm
bgt $a, $b, do_A
beq $a, $b, do_A
j do_B

do_A:
# do A

do_B:
# do B
```
#### 条件的与
同样的，用多层if-else改写
```cpp
if (conditionA && conditionB) {
// do A
} else {
// do B
}
```
改写为
```cpp
if (conditionA) {
    if(conditionB) {
    // do A
    } else {
    // do B
    }
} else {
    // do B
}
```
MIPS中的例子(`a > 0 && b > 0`)
```mipsasm
# 条件成立do_A，不成立do_B
bgtz $a, a_true
j do_B

a_true:
bgtz $b, do_A
j do_B

do_A:
# do A

do_B:
# do B
```
这样似乎代码太复杂了。我们可以使用将条件与转化为条件的反面的或，根据德摩根律，只要将条件成立与不成立对应的跳转位置反转一下就行了。
```mipsasm
bltz $a, do_B
bltz $b, do_B
j do_A

do_A:
# do A

do_B:
# do B
```
## 循环
循环的写法很简单，就是在一个反复跳转到自己的标签中判断是否满足**跳出循环的条件**。
对于一般的while循环：
```cpp
while(a < 0){
// do A
}
// do B
```
可以写作
```mipsasm
loop:
bgtz $a, loop_done
# do A
j loop

loop_done:
# do B
```
至于for循环，学过程设的我们知道for循环可以改写为while循环，我们只需要在循环内部自己维护一个变量控制什么时候跳出循环就可以了，因此不再赘述了。
# 数组和字符串
## .data
在MIPS中我们一般将代码部分写在`.text`字段的下面，`.data`字段用于声明程序的数据。因为寄存器只有32个，我们无法仅使用寄存器来实现数组和字符串，所以我们就要用到`.data`。在`.data`下，我们一般用这样的结构：
```mipsasm
.data
标签名: 数据指示符 初始值或空间大小
```
一些例子：
```mipsasm
.data
    num: .word 114514 # .word表示存放1个字（4字节的大小），一般存整数
    arr: .word 325, 799, 947 #列出多个值表示存放数组
    str1: .ascii "kasumi" #.ascii表示存放一个字符串，不添加'\0'
    str2: .ascii "arisa" #.asciiz表示存放一个字符串，结尾添加'\0'
    space: .space 400 #表示预留400个字节的缓冲区，字符串和数组都要用到这个指示符！
```
我们知道，一个整数（int）占用4个字节即1个字，一个字符（char）占用1个字节，字符串实际上是字符组成的数组，以及字符串的末尾还需要一个`\0`（使用syscall输入的时候也会自己添加）。**所以，存下一个大小为`n`的数组，需要的字节数为`4 * n`；存下一个长度为`n`的字符串，需要的字节数为`n + 1`。**
## 相关的指令
```mipsasm
la $t0, label # 将数据标签的地址放入$t0
# 以下offset是一个整数立即数，表示偏移值
lw $t1, offset($t0) # 从（$t0 + offset）这个地址读取一个字放到$t1
sw $t1, offset($t0) # 将$t1寄存器中的一个字存放到地址
lbu $t1, offset($t0) # 读取一个字节，零扩展到32位
sb $t1, offset($t0) # 将寄存器的最低8位存到对应地址
```
这里的`offset($t0)`的用法：例如`$t0`存放了整数数组`arr`的地址,`4($t0)`,表示数组起始地址偏移+4个字节，也就是偏移了一个整数，即`arr[1]`。
在实际应用中，如果我们对应的下标存在寄存器中，就可以直接对地址进行运算（地址运算时用无符号运算）：
```mipsasm
# 将arr[2]读取到$t2
la $s0, arr
li $s1, 2            # i = 2
sll  $t0, $s1, 2     # 字节偏移 = i × 4
addu $t1, $s0, $t0   # 元素地址 = 首地址 + 偏移
lw $t2, 0($t1)       # 读取arr[i]
```
由于字符串也是数组，我们用类似的方法访问其中的某一位，只是这里下标不需要`* 4`了
```
la $s0, str
li $s1, 1            # 下标1，即第二个字符
addu $t0, $s0, $s1
lbu  $t1, 0($t0)
```
以及这里字符也是用对应的ascii码储存的，与C语言的char一样。
## 字符串的输入输出
字符串的输入输出也使用syscall。服务8读取字符串，服务4输出字符串。
输入输出字符串时，要先用`la`获取缓冲区的地址，存在`$a0`。然后特别要注意的是，输入字符串时，需要在`$a1`写入容量大小。**这里的容量包括了最后的结束符`'\0'`**。也就是说，读入长度为`n`的字符串需要将`$a1`设置为`n + 1`。
```mipsasm
.data
buffer: .space 100

.text
    # 读取字符串
    la $a0, buffer
    li $a1, 100
    li $v0, 8
    syscall

    # 输出字符串
    la $a0, buffer
    li $v0, 4
    syscall
```
