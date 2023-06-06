---
title: "What is a Goroutine?"
author: Max Yankov
date: "2020-02-06"
images:
  - "/img/Go_Lang_Gopher.webp"
---

Welcome to our exploration of one of Go's most exciting features: Goroutines, the heart of Go's approach to concurrency. In this post, we'll walk you through why goroutines matter, illustrate how to use them with practical examples, and highlight common patterns and pitfalls for newcomers.

## Concurrency

Modern processors are capable of executing multiple tasks at the same time, or concurrently. This means our programs can perform multiple tasks at once, making them faster and more efficient. To take full advantage of these capabilities, we need to write concurrent programs.

For example, imagine a restaurant. The restaurant is serving multiple customers at the same time. Each customer is a separate task that needs to be handled. The chef, the waiter, and the cashier can all be working on different tasks for different customers concurrently. In computing, we have similar needs. We might have many users sending requests to our website at the same time and we need to handle all of them quickly.

**Processes**, **threads**, and **green threads** (aka lightweight threads) are all different tools we use to achieve concurrency. The first two, processes and threads, are both managed by the operating system. A process is an instance of a running program, like your web browser — it's a whole separate restouraunt, using analogy above. Threads are like little sub-programs inside each process; they can do different things but share memory, like how all the staff in the restaurant share the same kitchen. The management of processes and threads by the operating system makes them heavier in terms of resource usage. For example, Apache HTTP server used to create a single thread for each new connection — things easily became slow and inefficient when you have many concurrent connections, which was a big problem.

In low-level languages like C and C++, managing concurrent execution can be quite complex as the programmer needs to handle many low-level details manually, such as creating threads, synchronizing them, and sharing memory safely. On the other hand, Go makes it much simpler with the concept of goroutines, which are lightweight (green) threads managed by the Go runtime. They can be created and destroyed much faster, and you can create a lot more of them.

## Writing a basic goroutine

Let's see how we can write a basic goroutine. We'll start by creating a function that prints a message to the console. Then, we'll call this function in the main function. Finally, we'll add the **go** keyword before the function call to make it run concurrently.

```go
package main

import (
   "fmt"
   "time"
)

func sayHello() {
    fmt.Println("Hello from goroutine!")
}

func main() {
    go sayHello()
    fmt.Println("Hello from main!")
    time.Sleep(time.Second)
}
```

_[Open in go playground](https://play.golang.com/p/hBdza5otbCJ)_

When you run this program, you'll see "Hello from main!" printed first, then "Hello from goroutine!". Notice `time.Sleep(time.Second)` at the end — is to make sure the main function doesn't return before the goroutine has a chance to run.

## Typical use patterns

You can use goroutines for many tasks. However, two common patterns of using goroutines in web servers are the _never-ending loop_ and the _fire-and-forget_.

### Never-Ending Loop

This pattern is often used for tasks that need to keep running in the background, like a server performing a health check:

```go
package main

import (
    "fmt"
    "time"
)

func healthCheck() {
    for {
        // Simulate a health check
        fmt.Println("Performing health check...")
        time.Sleep(time.Second * 2)
    }
}

func main() {
    go healthCheck()
    // Simulate main work
    for i := 0; i < 5; i++ {
        fmt.Println("Main work is running...")
        time.Sleep(time.Second * 1)
    }
}

```

_[Open in go playground](https://play.golang.com/p/TSkKG8A8RFJ)_

In this code, the `healthCheck` function keeps running in the background, periodically performing a "health check" every 2 seconds, while the main function continues with its work.

### Fire-and-Forget

Fire and forget is a pattern used for tasks that need to be executed in the background, but don't need to be monitored. It's typically used to handle incoming requests, or, for example, logging:

```go
package main

import (
    "fmt"
    "time"
)

func logActivity(activity string) {
    // Simulate logging
    fmt.Println("Logging activity:", activity)
}

func main() {
    for i := 0; i < 5; i++ {
        activity := fmt.Sprintf("Activity #%d", i)
        go logActivity(activity)
        // Simulate main work
        fmt.Println("Main work is running...")
        time.Sleep(time.Second * 1)
    }
    // Allow some time for logging to complete
    time.Sleep(time.Second * 1)
}
```

_[Open in go playground](https://play.golang.com/p/z8krD4AvUey)_

In this code, the `logActivity` function is called in a goroutine each time an activity happens. This means the logging can happen in the background, without slowing down the main work.

## Channels

Other languages, like C, C++ and Java, use **shared memory** to coordinate communication between threads. This can be tricky to get right, as you need to make sure the memory is accessed safely by the different threads. Go uses a different approach, called **channels**, to achieve the same goal. Channels are a typed conduit through which you can send and receive values with the channel operator, `<-`.

In Go, channels are a way for goroutines to communicate with each other and synchronize their execution. They can be used to send and receive values between goroutines, much like using a mailing system. This makes it easy to pass data and signals around between your goroutines.

Here's a simple example of using channels to send a message from one goroutine to another:

```go
package main

import (
    "fmt"
    "time"
)

func sendGreeting(channel chan string) {
    time.Sleep(2 * time.Second)
    channel <- "World!"
}

func main() {
    messageChannel := make(chan string)
    go sendGreeting(messageChannel)
    fmt.Println("Hello") // executed immediately
    message := <-messageChannel
    fmt.Println(message) // executed after receiving a message
}
```

_[Open in go playground](https://play.golang.com/p/02EmdqXLzW0)_

In this example, the main function creates a channel of type string using the `make` function. Then, it calls the `sendGreeting` function in a goroutine, passing the channel as an argument. The `sendGreeting` function sleeps for 2 seconds, then sends the string `"World!"` to the channel. Finally, the main function receives the message from the channel and prints it to the console.

We will be covering channels in depth in our next blog post. There we will talk about bufferred and unbuffered channels, closing channels, and range loops with channels, among other topics. Stay tuned for more!

## How to fail with goroutines

Goroutines are great, but they can also cause problems if not used correctly. Let's see how we can fail with goroutines.

### Forgetting to use **go** keyword

Functions that you run with goroutines are just regular functions that can be called normally. If you forget to use the **go** keyword, the function will be called normally, and the program will wait for it to finish before continuing, which might not produce the result that you expect. For example, the first example in this article would print "Hello from goroutine!" first, then "Hello from main!" if we forgot to use the **go** keyword:

```go
package main

import (
   "fmt"
   "time"
)

func sayHello() {
    fmt.Println("Hello from goroutine!")
}

func main() {
    sayHello() // Forgot to use go keyword
    fmt.Println("Hello from main!")
    time.Sleep(time.Second)
}
```

_[Open in go playground](https://play.golang.com/p/K4cjz3xxmiS)_

### Abrupt Termination of Goroutines

A key thing to remember is that the termination of the main function in your program will lead to the abrupt termination of all goroutines, regardless of whether they have finished executing or not. Beginners often forget this, leading to programs that don't behave as expected.
Here's an example of this pitfall:

```go
package main

import "fmt"

func printNumber() {
    for i := 1; i <= 10; i++ {
        fmt.Println(i)
    }
}

func main() {
    go printNumber()
}
```

_[Open in go playground](https://play.golang.com/p/MXzWcJB4nrK)_

In this program, you might expect it to print the numbers 1 through 10. However, because the main function returns immediately after starting the goroutine, it's likely that the program will end before the goroutine has a chance to print anything.

A common way to make sure the goroutine has finished executing is to use a channel to signal completion:

```go
package main

import "fmt"

func printNumber(done chan bool) {
    for i := 1; i <= 10; i++ {
        fmt.Println(i)
    }
    done <- true
}

func main() {
    done := make(chan bool)
    go printNumber(done)
    <-done
}
```

_[Open in go playground](https://play.golang.com/p/vxNVweF_P-R)_

Here, we've added a `done` channel. The `printNumber` function sends a value on this channel when it's done, and the `main` function waits for a value on this channel before returning.

### Non-determenistic behaviour

Another common pitfall is expecting goroutines to execute in a specific order. Goroutines are scheduled by the Go runtime, not by the programmer, and the order in which they execute is **non-deterministic**.

Here's an example:

```go
package main

import (
    "fmt"
    "time"
)

func printNumber(count int) {
    fmt.Println(count)
}

func main() {
    for i := 0; i < 10; i++ {
        go printNumber(i)
    }
    time.Sleep(time.Second)
}
```

_[Open in go playground](https://play.golang.com/p/6Z3Z3Z2Z3Z3)_

In this program, you might expect it to print the numbers 0 through 9. However, because the goroutines are scheduled by the Go runtime, it's likely that the program will print the numbers in a different order each time it's run.

We could fix this problem using channels too, but it would still be a **bad design**. The reason is that goroutines should ideally be designed to perform tasks that are independent of each other. If the execution of one goroutine is heavily dependent on the execution of another, then it might be a sign that goroutines are not the most suitable tool for that particular task.

Remember, while goroutines are a powerful tool for executing tasks concurrently, they're not always the best solution for every problem. Just as with any other tool, they should be used wisely and appropriately. When goroutines have a strict execution order or heavy interdependencies, it might be better to use a simpler, linear execution model.

This example illustrates an important principle: The design of your program should fit the problem you're trying to solve.

## Further reading

As we continue our journey into Go's world of concurrency, we'll encounter more tools that help manage and coordinate goroutines effectively. While we've introduced goroutines and channels in this post, there are other concepts from traditional concurrent programming - **Mutexes** and **WaitGroups** - that we'll explore in future posts.

Mutexes or "mutual exclusion objects" safeguard shared data from simultaneous access, a common problem known as a race condition. WaitGroups, meanwhile, let us block our program's execution until certain goroutines have completed.

However, these tools, while important, reflect a more traditional approach to concurrency seen in other languages. One of Go's unique strengths is its emphasis on managing concurrency through communication - that's where channels come in.

Go encourages us to think in terms of independently executing goroutines that communicate via channels. This approach, often summarized as "Do not communicate by sharing memory; instead, share memory by communicating," is central to effective Go programming.