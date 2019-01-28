---
title: Componsition over Inheritance
categories:
 - java
tags:
 - java, effective java, book, inheritance, composition
---

Inheritance is a powerful feature of the OOP that is used to achieve code reusability. But it is not always the best tool for the job. It is safe to use inheriance within a same package, and the reason is because super and sub classes are under the control of the same team (Or even a same developer). The issues are started when the developer of the super class and sub classes are different teams. It may occur that super class has not been designed to being inherited. So what kind of problems may occur when we extend the class which is not devoted to be inherited. 

## Issues of un-intended inheritance

First of all subclass starts having dependancy on the implementation details of its superclass members and methods. The superclass's implementation may change from release to release, and if it does, the subclass may break, even though its code has not been touched. Developer of the subclass must be always aware of that and everytime when the superclass is upgraded it must be checked for new changes. Tons of test codes must run to check the confidence. At some point it will become almost impossible to trace all the inherited classes. 

As a proove lets give an example from the Effective Java book, where some juggling with HashSet class were performed. Simply we want to track the number of added elements to the set. 

```java
public class InstrumentedHashSet<E> extends HashSet<E> {
    // The number of attempted element insertions
    private int addCount = 0;

    public InstrumentedHashSet() {        
    }

    public InstrumentedHashSet(int initCap, float loadFactor) {
        super(initCap, loadFactor);
    }

    @Override public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }
}
```

If the List with three elements are added then expected result is not received. The following code example:

```java
InstrumentedHashSet<String> s = new InstrumentedHashSet<>();
s.addAll(List.of("Rustam", "Kim", "Park"));
```

After running the above code if the getAddCount() is called the result will be 6 not 3. Because HashSet's addAll method is implemented on top of its add method, means original addAll itself not supposed to increase the counter. There are multiple solutions to avoid this issue after we find out the problem:
1. remove counter incrasement at the addAll() method
2. do not call super.addAll() and just perform by iterating the given argument and performing increasement.

But it should be remembered these solutions might be temporary, until the new version of the parent class is released with new kind of surprise features.


## Composition

In order to avoid all of the problems described above, instead of extending an existing class, give your new class a private field that references an instance of the existing class. This is called composition way of approach. Each instance method in the new class invokes the corresponding method on the contained instance of the existing class and returns the results. It is also known as forwarding methods. The resulting class will be rock solid, with no dependencies on the implementation details of the existing class. Even addition of the new methods in the new version will have no impact on the new class. Above example can be implemented as follows:

```java
// Wrapper class - uses composition in place of inheritance
public class InstrumentedSet<E> extends ForwardingSet<E> {
    private int addCount = 0;
    public InstrumentedSet(Set<E> s) {
        super(s);
    }
    @Override public boolean add(E e) {
        addCount++;
        return super.add(e);
    }
    @Override public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }
    public int getAddCount() {
        return addCount;
    }
}

// Reusable forwarding class
public class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;
    public ForwardingSet(Set<E> s) {this.s = s;}

    public void clear()                 { s.clear();}
    public boolean contains(Object o)   { return s.contains(o); }
    public boolean isEmpty()            { return s.isEmpty(); }
    public int size()                   { return s.size(); }
    public Iterator<E> iterator()       { return s.iterator(); }
    public boolean add(E e)             { return s.add(e); }
    public boolean remove(Object o)     { return s.remove(o); }
    public boolean containsAll(Collection<?> c)
                                        { return s.containsAll(c); }
    public boolean addAll(Collection<?> c)
                                        { return s.addAll(c); }
    public boolean removeAll(Collection<?> c)
                                        { return s.removeAll(c); }
    public boolean retainAll(Collection<?> c)
                                        { return s.retainAll(c); }
    public Object[] toArray()           { return s.toArray(); }
    public <T> T[] toArray(T[] a)       { return s.toArray(a); }
    
    @Override public boolean equals(Object o) {return s.equals(o); }
    @Override public int hashCode()     { return s.hashCode(); }
    @Override public String toString()  { return s.toString(); }
}
```




--------------------------------------

When we use Spring Security in a standard way, it performs quite a standard actions. For example, Spring Security blocks the un-authenticated requests to the resource (URL resource) and redirects (with 302) to the /login page. But sometimes we want different behavior. Customized behavior such as if the requester is web-browser we want to redirect them to the /login page. But if the requester is not a browser and purely generates RestAPI type of request, then redirection would have no sense. Of course, we could have written some logic on the requester client side to consider 302 as non-authorized behavior.

I have started searching for the solution to this issue. Couldn't find a solution with the standard Spring Security approach (couldn't find some kind of option for Spring Security which we could just turn on or off to get this behavior).

I have approached it with a filter solution, which registered at the configuration phase:

```java
@Override
protected void configure(final HttpSecurity http) throws Exception {
        http.addFilterBefore(new ContentTypeApplicationJsonFilter(domainName), FilterSecurityInterceptor.class);
}
```


Here is the filter itself:

```java
public class ContentTypeApplicationJsonFilter extends GenericFilterBean {

    private String domainName;
    private AccessDeniedHandler accessDeniedHandler = new AccessDeniedHandlerImpl();
    private AuthenticationTrustResolver authenticationTrustResolver = new AuthenticationTrustResolverImpl();

    public ContentTypeApplicationJsonFilter(String domainName) {
        this.domainName = domainName;
    }

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response, FilterChain filterChain) throws IOException, ServletException {

        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {

            if (e instanceof AccessDeniedException) {
                HttpServletRequest rq = (HttpServletRequest) request;
                HttpServletResponse rs = (HttpServletResponse) response;

                if (isAjax(rq)) {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    if (authentication == null || authenticationTrustResolver.isAnonymous(authentication)) {
                        rs.sendError(HttpStatus.UNAUTHORIZED.value(), domainName);
                    } else {
                        accessDeniedHandler.handle(rq, rs,
                                (AccessDeniedException) e);
                    }
                }
                else {
                    throw e;
                }
            }
        }
    }

    private Boolean isAjax(HttpServletRequest request) {
        return request.getContentType() != null &&
                request.getContentType().contains("application/json");
    }
}
```

The code of filter above is quite a simple one. ```filterChain.doFilter(request, response);``` simply joins to the filter chain and does nothing, until exception case happens and processing is started only when *AccessDeniedException* is thrown.

```java
if (isAjax(rq)) {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    if (authentication == null || authenticationTrustResolver.isAnonymous(authentication)) {
                        rs.sendError(HttpStatus.UNAUTHORIZED.value(), domainName);
                    } else {
                        accessDeniedHandler.handle(rq, rs,
                                (AccessDeniedException) e);
                    }
                }
                else {
                    throw e;
                }

```

isAjax is the function that checks the request being json content-type or not. If it is confirmed to be json type then user checked being authenticated or not. This was required to distinguish the errors 401 and 403. *authenticationTrustResolver.isAnonymous* checks if the user is anonymous or not, if anonymous then definitely throwing UNAUTHORIZED 401 is suitable. In all other cases, the processing is given to AccessDeniedHandler who is going to throw 403 FORBIDDEN. 

In case if the traffic is not ajax (content type is not "application/json") then the exception is thrown and forwarded to the upper layer to process, where it will be decided by upper layers. And upper layer exception processor is Spring Security exception processor, who immediately redirects to /login page.

Little note here is while we are sending UNAUTHORIZED message back to the requester client we are inserting the message with domain name. It is given just in case if the requester client is smart enough to decide to for login page. But it is absolutely up to client to decide does it needs to be logged in or just keep its way out of it.

## Test with Java Script

In order to test above described behavior simple java script code can be used:

```
function callJson() {
        var xhttp = new XMLHttpRequest();
        xhttp.withCredentials = true;

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert(this.responseText);
            }
        };

        xhttp.open("GET", "http://localhost:8080/necessaryAPIController", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send();
    }

...

<button type="submit" onclick="callJson()">callJson</button>

```

