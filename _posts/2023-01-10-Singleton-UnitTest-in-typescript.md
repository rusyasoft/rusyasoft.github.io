---
title: Singleton Unit test in typescript
categories:
 - typescript
tags:
 - typescript, unit test, singleton
---

[Singleton](https://en.wikipedia.org/wiki/Singleton_pattern) is one of the most popular Design Pattern, that we can meet practically in any project. Sometime we try not to use it and design the project Singleton free, but sooner or later we all end up using it. Then question raise how to unit test it and all languages have methods. I run into a small task, where had to write a unit test for a singleton in typescript. Most of my searches were not that great, where in some places people suggested to have a reset() function, while [others](https://www.technicalfeeder.com/2020/10/unit-test-for-singleton-class/) have suggested cheating ways by using 'any' casting. Finally got a good suggestion from my colleague to use extend test class from original singleton, and in constructor purposefully call parent's constructor, where we actually can do proper reset. (credits to [Nathan](https://www.linkedin.com/in/nathan-magnus)).

## Example of Singleton

```typescript
class Singleton {
    public static Instance = new Singleton();
    private int counter = 0;
    
    protected constructor() {
        this.counter = 0;
    }

    public void increment() {
        this.counter++;
    }

    public int getCounter() {
        return this.counter;
    }
}
```

## Unit Test Example of Singleton

Here is the test class that would look pretty simple

```typescript
class SingletonTest extends Singleton {
    public constructor() {
        super();
    }
}
```

After that we can just write our Jest based unit test boilerplate. The following code can be in the same file as SingletonTest, that way you will make sure its not used anywhere else.

```typescript
describe("Singleton unit test", () => {
    beforeEach(() => {
        Singleton.Instance = new SingletonTest();
    });

    it("lets test Singleton with two increments", () => {
        const singleton = Singleton.Instance;
        singleton.increment();
        singleton.increment();
        expect(singleton.getCounter()).toEqual(2);
    });

    it("lets test Singleton with three increments", () => {
        const singleton = Singleton.Instance;
        singleton.increment();
        singleton.increment();
        singleton.increment();
        expect(singleton.getCounter()).toEqual(3);
    });
}
```

## Conclusion

Obviously this is very primitive Singleton indeed but it solves main issue. It protects resetting your singleton instance in your main code, unless you will create similar helper class intentionally. We can go more sophisticated way by implementing getter of instance and do creation of instance by condition. If instance is null then create a new again, that way we could avoid using helper test class.

```typescript
// assuming we have getInstance() with following impelemntation
public getInstance(): Singleton {
    if (this.Instance === null) {
        this.Instance = new Singleton();
    }
    return this.Instance;
}
```

Then resetting would be as easy as follows:

```typescript
beforeEach(() => {
    Singleton.Instance = null;
});
```

then we have to make sure we always going to use getInstance(), nobody can guarantee that by mistake we may use `Singleton.Instance`.