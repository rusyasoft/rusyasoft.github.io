---
title: (Spring Security) Introduction
categories:
 - spring-security
tags:
 - books, review, spring security, microservices, introduction
---

Today I'm starting the series of Spring-Security articles, and most of them will be references from web-sites and book named "Spring-Security" from authors Mick Knutson,Robert Winch and Peter Mularien. Before going into an example of Spring Security lets clarify why do we need spring security.

# Why do We Need Spring Security ?

The internet based hacking has been born with the internet itself and no need to go for detail history about it. They guys who has long experience of web development already seen many kinky ways of internet exploitations. They already have developed skills to stand against those attacks and when they develop something they can write the code that protects agains those attacks. But human factor still remains and developers may forget put the measurements against some existing attacks, then it repeats again. That is ok if the professional forgot to put some prevention code for specific attack, he can remember later and recode it. But what about newcomer, who has no idea about it, he should learn from seniors and it may take a years and years. That is why people started developing the frameworks, that are already contains those preventions by default. There are many such frameworks out there, and many more coming. Here we will talk about Spring Security, which is basically security framework that works and developed particularly to work with spring framework.

Here some are the features provided by default:

- CSRF attack prevention
- Session Fixation protection
- Security Header integration
 - HTTP Strict Transport Security for secure requests
 - X-Content-Type-Options integration
 - Cache Control
 - X-XSS-Protection integration
 - X-Frame-Options integration to help prevent Clickjacking


# Lets Start with Hello Spring Security

First of all we have to integrate Spring Security into our code by declaring it in the gradle configuration file build.gradle:

```

dependencies {
    compile ('org.springframework.security:spring-security-config')
    compile ('org.springframework.security:spring-security-core')
    compile ('org.springframework.security:spring-security-web')
}
```

sometime we may be pushed to declare the version. For Spring Boot users who love to just easy start with starters the following starter adding line could work too:

```

dependencies {    
    compile('org.springframework.boot:spring-boot-starter-security')
}
```

Most basic start of the spring security is done by declaring the configuration bean:

```JAVA

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    private static final Logger logger = LoggerFactory
            .getLogger(SecurityConfig.class);

    /**
     * Configure AuthenticationManager with inMemory credentials.
     *
     * @param auth       AuthenticationManagerBuilder
     * @throws Exception Authentication exception
     */
    @Override
    public void configure(final AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication().withUser("rustam").password("123").roles("USER");
    }

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/**").access("hasRole('USER')")
                .and().formLogin()
                .and().httpBasic()
                .and().logout()

                // CSRF is enabled by default, with Java Config
                .and().csrf().disable();
    }
}
```

In above code we have two configure methods overriden, and they will block from accessing to basically any url "/**" all users who doesn't hold "USER" role (defined in a second configure method). Next obvious question how do we define which role who has, that is defined in a first configure() method. Since this is demonstrative example the authentication is performed in memory. 
- In the first configure we are declaring a user with the name "rustam" with the super-secret password "123" who has "USER" role after successful login. 
- Second configure() methods is more about Authorization which says to access "/**" user must have "USER" role. formLogin() calls default login page provided by Spring Security. 
- httpBasic() says the authentication is performed by HttpBasic method
- logout() says to make it available logout url at /logout. Here what official document says about it *The default is that accessing the URL "/logout" will log the user out by invalidating the HTTP Session, cleaning up any rememberMe() authentication that was configured, clearing the SecurityContextHolder, and then redirect to "/login?success*
- csrf().disable() says to disable CSRF prevention which is turned on by default
- and() is the chainer that is used to help the chain all these functionalities together

