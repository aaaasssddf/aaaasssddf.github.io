---
layout: posts
title: 算法板子
date: 2026-11-25 10:24:11
categories:
  - 算法分析与设计
tags:
  - 算法
toc:
  # 是否启用目录
  enable: true
  # 是否自动添加目录编号
  number: true
  # 是否自动换行
  wrap: false
  # 是否展开所有目录项
  expand_all: true
  # 最大目录深度
  max_depth: 6
---
软院大二算法分析与设计板子合集，代码主要由ai整理生成。
<!-- more -->
# 基础板子
```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using pii = pair<int, int>;
using pli = pair<ll, int>;

const int INF = INT_MAX / 4;
const ll LINF = LLONG_MAX / 4;

void solve()
{
    // 读取输入

    // 初始化数据结构

    // 实现算法

    // 输出答案
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T = 1;
    // cin >> T; // 题目给出测试组数时取消注释

    while (T--)
        solve();

    return 0;
}
```
# 图
公共定义
```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const ll INF = LLONG_MAX / 4;

// 无权邻接表
using Graph = vector<vector<int>>;

// 带权邻接表：{终点, 权值}
using WGraph = vector<vector<pair<int, ll>>>;

// 距离与前驱
vector<ll> dist(n + 1, LINF);
vector<int> parent(n + 1, -1);

// 访问标记
vector<int> visited(n + 1, 0);

// BFS 队列
queue<int> q;

// Dijkstra 小根堆：{距离, 节点}
priority_queue<pli, vector<pli>, greater<pli>> heap;

// 边表
struct Edge {
    int u, v;
    ll w;
};
```
### BFS
| 参数 | 含义 |
|---|---|
| `start` | 搜索起点 |
| `g` | 图的邻接表，`g[u]` 保存与 `u` 相邻的节点 |
| `dist` | 保存从起点到各节点的最短距离 |
| `parent` | 保存最短路径上各节点的前驱，用来恢复路径 |
```cpp
void bfs(int start, const vector<vector<int>>& g,
         vector<int>& dist, vector<int>& parent)
{
    int n = (int)g.size() - 1;

    dist.assign(n + 1, -1);
    parent.assign(n + 1, -1);

    queue<int> q;
    q.push(start);
    dist[start] = 0;

    while (!q.empty())
    {
        int u = q.front();
        q.pop();

        for (int v : g[u])
        {
            if (dist[v] != -1)
                continue;

            dist[v] = dist[u] + 1;
            parent[v] = u;
            q.push(v);
        }
    }
}
```
### DFS
| 参数 | 含义 |
|---|---|
| `u` | 当前正在访问的节点 |
| `g` | 邻接表，`g[u]` 保存 `u` 的邻接点 |
| `color` | 节点状态：`0` 未发现，`1` 搜索中，`2` 已完成 |
| `discover` | 每个节点的发现时间 |
| `finish` | 每个节点的完成时间 |
| `timer` | 所有递归调用共用的时间计数器 |
```cpp
void dfs(int u, const vector<vector<int>>& g,
         vector<int>& color,
         vector<int>& discover,
         vector<int>& finish,
         int& timer)
{
    color[u] = 1;
    discover[u] = ++timer;

    for (int v : g[u])
    {
        if (color[v] == 0)
            dfs(v, g, color, discover, finish, timer);
    }

    color[u] = 2;
    finish[u] = ++timer;
}
```
### 拓扑排序-Kahn算法
| 参数 | 含义 |
|---|---|
| `g` | 有向图的邻接表，节点编号为 `1..n` |
| `order` | 保存得到的拓扑序 |
| 返回 `true` | 所有节点都成功排序，图中无环 |
| 返回 `false` | 图中有环，`order` 不是完整拓扑序 |
```cpp
bool topological_sort(const vector<vector<int>>& g,
                      vector<int>& order)
{
    int n = (int)g.size() - 1;
    vector<int> indegree(n + 1, 0);

    for (int u = 1; u <= n; u++)
        for (int v : g[u])
            indegree[v]++;

    queue<int> q;

    for (int u = 1; u <= n; u++)
        if (indegree[u] == 0)
            q.push(u);

    order.clear();

    while (!q.empty())
    {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : g[u])
        {
            indegree[v]--;

            if (indegree[v] == 0)
                q.push(v);
        }
    }

    return (int)order.size() == n;
}
```
### 非负权单源最短路-Dijkstra
| 参数 | 含义 |
|---|---|
| `start` | 起点 |
| `g` | 带权邻接表，节点编号为 `1..n` |
| `dist[v]` | 起点到 `v` 的最短距离，`INF` 表示不可达 |
| `parent[v]` | 最短路径上 `v` 的前一个节点 |
```cpp
void dijkstra(int start, const WGraph& g,
              vector<ll>& dist, vector<int>& parent)
{
    int n = (int)g.size() - 1;
    dist.assign(n + 1, INF);
    parent.assign(n + 1, -1);

    priority_queue<pair<ll, int>,
                   vector<pair<ll, int>>,
                   greater<pair<ll, int>>> q;

    dist[start] = 0;
    q.push({0, start});

    while (!q.empty())
    {
        auto [d, u] = q.top();
        q.pop();

        if (d != dist[u]) continue;

        for (auto [v, w] : g[u])
        {
            if (dist[u] + w < dist[v])
            {
                dist[v] = dist[u] + w;
                parent[v] = u;
                q.push({dist[v], v});
            }
        }
    }
}
```
### DAG最短路
```cpp
bool dag_shortest_path(int start, const WGraph& g,
                       vector<ll>& dist)
{
    int n = (int)g.size() - 1;
    Graph plain(n + 1);

    for (int u = 1; u <= n; u++)
        for (auto [v, w] : g[u])
            plain[u].push_back(v);

    vector<int> order;
    if (!topological_sort(plain, order))
        return false;

    dist.assign(n + 1, INF);
    dist[start] = 0;

    for (int u : order)
    {
        if (dist[u] == INF) continue;

        for (auto [v, w] : g[u])
            dist[v] = min(dist[v], dist[u] + w);
    }

    return true;
}
```
//TODO
# 计算几何
公共定义
```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using i128 = __int128_t;

struct Point
{
    ll x, y;

    Point operator+(const Point& b) const
    {
        return {x + b.x, y + b.y};
    }

    Point operator-(const Point& b) const
    {
        return {x - b.x, y - b.y};
    }

    bool operator<(const Point& b) const
    {
        if (x != b.x) return x < b.x;
        return y < b.y;
    }

    bool operator==(const Point& b) const
    {
        return x == b.x && y == b.y;
    }
};

// 向量点积：a · b
i128 dot(Point a, Point b)
{
    return (i128)a.x * b.x + (i128)a.y * b.y;
}

// 向量叉积：a × b
i128 cross(Point a, Point b)
{
    return (i128)a.x * b.y - (i128)a.y * b.x;
}

// AB × AC：判断 A -> B -> C 的转向
i128 cross(Point a, Point b, Point c)
{
    return cross(b - a, c - a);
}

// 两点距离的平方
i128 dist2(Point a, Point b)
{
    Point d = a - b;
    return dot(d, d);
}

// 两点距离
long double distance_of(Point a, Point b)
{
    return sqrtl((long double)dist2(a, b));
}

// 返回 -1、0、1
int sign(i128 x)
{
    return (x > 0) - (x < 0);
}

// 排序、去掉重复点
vector<Point> unique_points(vector<Point> p)
{
    sort(p.begin(), p.end());
    p.erase(unique(p.begin(), p.end()), p.end());
    return p;
}
```
### 判断点在线段上
点`p`，线段`AB`
```cpp
bool on_segment(Point p, Point a, Point b)
{
    return cross(a, b, p) == 0 &&
           min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}
```
### 判断线段是否相交
```cpp
bool segments_intersect(Point a, Point b, Point c, Point d)
{
    i128 c1 = cross(a, b, c);
    i128 c2 = cross(a, b, d);
    i128 c3 = cross(c, d, a);
    i128 c4 = cross(c, d, b);

    // 处理共线、端点接触等情况
    if (c1 == 0 && on_segment(c, a, b)) return true;
    if (c2 == 0 && on_segment(d, a, b)) return true;
    if (c3 == 0 && on_segment(a, c, d)) return true;
    if (c4 == 0 && on_segment(b, c, d)) return true;

    // 两条线段分别跨过对方所在直线
    return sign(c1) * sign(c2) < 0 &&
           sign(c3) * sign(c4) < 0;
}
```
### 判断一组线段是否存在相交（暴力）
```cpp
bool any_intersection_brute(const vector<Segment>& seg)
{
    int n = (int)seg.size();

    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (intersect(seg[i], seg[j]))
                return true;

    return false;
}
```
## 凸包
### Graham算法
```cpp
vector<Point> graham(vector<Point> p)
{
    sort(p.begin(), p.end());
    p.erase(unique(p.begin(), p.end()), p.end());

    int n = (int)p.size();
    if (n <= 2) return p;

    int pos = 0;

    for (int i = 1; i < n; i++)
    {
        if (p[i].y < p[pos].y ||
            (p[i].y == p[pos].y && p[i].x < p[pos].x))
        {
            pos = i;
        }
    }

    swap(p[0], p[pos]);
    Point start = p[0];

    sort(p.begin() + 1, p.end(),
         [start](const Point& a, const Point& b)
         {
             i128 c = cross(start, a, b);

             if (c != 0) return c > 0;
             return dist2(start, a) < dist2(start, b);
         });

    vector<Point> hull;

    for (Point cur : p)
    {
        while (hull.size() >= 2 &&
               cross(hull[hull.size() - 2],
                     hull.back(), cur) <= 0)
        {
            hull.pop_back();
        }

        hull.push_back(cur);
    }

    return hull;
}
```
### Jarvis算法
```cpp
vector<Point> jarvis(const vector<Point>& p)
{
    int n = (int)p.size();
    if (n == 0) return {};

    int start = 0;

    for (int i = 1; i < n; i++)
    {
        if (p[i].y < p[start].y ||
            (p[i].y == p[start].y && p[i].x < p[start].x))
        {
            start = i;
        }
    }

    vector<Point> hull;
    int cur = start;

    do
    {
        hull.push_back(p[cur]);
        int candidate = -1;

        for (int i = 0; i < n; i++)
        {
            if (p[i] == p[cur]) continue;

            if (candidate == -1)
            {
                candidate = i;
                continue;
            }

            i128 c = cross(p[cur], p[candidate], p[i]);

            if (c < 0 ||
                (c == 0 &&
                 dist2(p[cur], p[i]) >
                 dist2(p[cur], p[candidate])))
            {
                candidate = i;
            }
        }

        // 所有点坐标相同
        if (candidate == -1) break;

        cur = candidate;

    } while (!(p[cur] == p[start]));

    return hull;
}
```
## 最近点对
### 暴力法
```cpp
i128 closest_pair_brute(const vector<Point>& p)
{
    i128 best = (i128)1 << 120;

    for (int i = 0; i < (int)p.size(); i++)
        for (int j = i + 1; j < (int)p.size(); j++)
            best = min(best, dist2(p[i], p[j]));

    return best;
}
```
### 分治法
```cpp
i128 closest_pair(vector<Point> p)
{
    sort(p.begin(), p.end());

    // 重合点的距离为 0
    for (int i = 1; i < (int)p.size(); i++)
        if (p[i] == p[i - 1])
            return 0;

    vector<Point> buffer(p.size());

    auto by_y = [](const Point& a, const Point& b)
    {
        if (a.y != b.y) return a.y < b.y;
        return a.x < b.x;
    };

    // 进入时区间按 x 划分，返回时区间按 y 排序
    function<i128(int, int)> solve = [&](int l, int r) -> i128
    {
        i128 best = (i128)1 << 120;

        if (r - l <= 3)
        {
            for (int i = l; i < r; i++)
                for (int j = i + 1; j < r; j++)
                    best = min(best, dist2(p[i], p[j]));

            sort(p.begin() + l, p.begin() + r, by_y);
            return best;
        }

        int mid = (l + r) / 2;
        ll mid_x = p[mid].x;

        i128 left_best = solve(l, mid);
        i128 right_best = solve(mid, r);
        best = min(left_best, right_best);

        merge(p.begin() + l, p.begin() + mid,
              p.begin() + mid, p.begin() + r,
              buffer.begin() + l, by_y);

        copy(buffer.begin() + l, buffer.begin() + r,
             p.begin() + l);

        if (best == 0) return 0;

        // 带状区域中的点已按 y 排序
        vector<Point> strip;

        for (int i = l; i < r; i++)
        {
            i128 dx = (i128)p[i].x - mid_x;
            if (dx * dx < best)
                strip.push_back(p[i]);
        }

        for (int i = 0; i < (int)strip.size(); i++)
        {
            for (int j = i + 1; j < (int)strip.size(); j++)
            {
                i128 dy = (i128)strip[j].y - strip[i].y;
                if (dy * dy >= best) break;

                best = min(best, dist2(strip[i], strip[j]));
            }
        }

        return best;
    };

    return solve(0, (int)p.size());
}
```