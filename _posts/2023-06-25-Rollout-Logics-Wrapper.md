---
title: Rollout Logics Wrapper
categories:
 - java
tags:
 - java, spring, deployment
---


In modern software development, the process extends beyond simply completing a task and moving on. It entails continuous work on new updates, features, and bug fixes. Therefore, the role of feature flags becomes crucial in the software's lifecycle. Feature flags can be classified as either static or dynamic, depending on the speed at which their changes are applied to the application's behavior. In this post, we will not discuss the various types of feature flags; instead, we will concentrate on the different approaches for writing code that depends on these variables and styles.

Let's examine the following typical example, where we have a ProductService responsible for retrieving product details by productId from the productRepository. The RenderService, on the other hand, obtains product details from the ProductService and then proceeds to render the page.

```java
class ProductService {
    private ProductRepository productRepository;
    public Product getProductDetails(Long productId) {
        return productRepository.find(productId);
    }
}

class RenderService {
    private ProductService producService;

    public Page renderProduct(Long productId) {
        Product product = productService.getProductDetails(productId);

        // Do a lot of other stuff required to render product page
        return renderFinalPage(product);
    }
}
```

## Now we got new Fast Product Repository

The story continues: Suddenly, the platform team introduces a new type of database that is incredibly fast. Queries on this new database respond much quicker compared to our current solution. The platform team has conducted some experiments, confirming its speed, and now they suggest that we adapt to this new database. As the owner of our service, we become enamored with the idea and are eager to embrace it. However, we mustn't forget that numerous other services also depend on us, and some of them rely on our libraries. We have a responsibility towards those who depend on us. If things were to go wrong later on, and it turns out that the Fast Repository isn't as fast as anticipated or hasn't been thoroughly tested in a real production network with significantly higher and different traffic patterns than those generated in the lab, we would bear the consequences.

So, we need to devise a rollout strategy for implementing the new database.

## Quick Rollout Way
Quick flag based rollout way would be the fastest and riskiest way of coming up. Example of it can be as follows and rely on application.properties value.

```java
class ProductService {
    private ProductRepository productRepository;
    private FastProductRepository fastProductRepository;

    @Value("${product.repo.fastFlag:false}")
    private Boolean fastProductRepoFlag;

    public Product getProductDetails(Long productId) {
        if (fastProductRepoFlag) {
            return fastProductRepository.find(productId);
        }
        return productRepository.find(productId);
    }
}
```

The advantage of this approach is that the implementation time is shorter, and the deployment can be carried out almost immediately. However, the main disadvantage is the inherent risk involved. By relying on luck alone, once we enable the feature flag, we are taking a gamble. This assumes that we do not have platform-level DevOps practices in place, where instances can be gradually deployed by not enabling the flag for all instances at once. To mitigate this risk, it is crucial to have robust platform deployment controls and traffic management in place. These measures can help reduce the potential negative impact of any unforeseen issues.

## Task Runner based Rollout

```java
public enum ProductRolloutPhase {
    FAST_PRODUCT_DISABLED,
    FAST_PRODUCT_DRY_RUN,
    FAST_PRODUCT_ENALBED;
}

class RolloutTask {
    private static final ProductRolloutPhase DEFAULT_ROLLOUT_PHASE = ProductRolloutPhase.FAST_PRODUCT_DISABLED;
    private static ThreadLocal<Boolean> productRolloutThreadLocal = new ThreadLocal<>();

    public static boolean getCurrentFlag() {
        if (productRolloutThreadLocal.get() == null) {
            return false;
        }

        return productRolloutThreadLocal.get();
    }

    public <T> T execute(ProductRolloutPhase rolloutPhase, Supplier<T> delegator) {
        boolean prevFlagValue = getCurrentFlag();
        try {
            if (rolloutPhase == FAST_PRODUCT_DISABLED) {
                productRolloutThreadLocal.set(false);
            } else if (rolloutPhase == FAST_PRODUCT_ENALBED) {
                productRolloutThreadLocal.set(true);
            } else { // DRY-RUN case
                productRolloutThreadLocal.set(true);
                try {
                    delegator.get();
                } catch (Exception ex) {
                    log.warn("DRY-RUN has failed: " + ex);
                }
                productRolloutThreadLocal.set(false);
            }

            return delegator.get();
        } finally {
            productRolloutThreadLocal.set(prevFlagValue);
        }
        
    }
}

class ProductService {
    private ProductRepository productRepository;
    private FastProductRepository fastProductRepository;

    public Product getProductDetails(Long productId) {
        if (RolloutTask.getCurrentFlag()) {
            return fastProductRepository.find(productId);
        }

        return productRepository.find(productId);
    }

    public Product getProductDetailsFast(Long productId) {
        return fastProductRepository.find(productId);
    }
}
```

Here is how the usage would look like:

```java
class RenderService {
    private ProductService producService;
    private ProductRolloutService productRolloutService;

    public Page renderProduct(Long productId) {
        Product product = productRolloutService.execute(FAST_PRODUCT_DISABLED, () -> {
            productService.getProductDetails(productId);
        });
        

        // Do a lot of other stuff required to render product page
        return renderFinalPage(product);
    }
}
```

In the above example, the FAST_PRODUCT_DISABLED flag is passed as an argument, indicating that the original DB-read should be used. When the customers of the ProductService are ready, they can begin running in a DRY-Run mode by passing FAST_PRODUCT_DRY_RUN as an argument. The purpose of the dry-run mode is to test the availability of the new fast-DB without fully relying on its data. If all services enable the dry-run mode, it allows us to assess the performance of the new fast-DB under full load. We can operate in this state for a certain period of time, ensuring safety and stability, and once assured, proceed to switch to the FAST_PRODUCT_ENABLED mode.

## Conclusion

Advantage of using a Task Runner Wrapper-based rollout is that it allows you to selectively enable the flag for specific calls rather than enabling it for all calls simultaneously. This granular control enables a gradual and controlled rollout of the feature. Additionally, the wrapper can be used to group a few calls under the same scope, providing flexibility in enabling the flag for a specific set of related operations.

Furthermore, this approach facilitates the implementation of a Dry-run mode, allowing for testing and validation without relying on actual data. It also offers the opportunity to measure response times and collect metrics for different versions of the call, aiding in performance evaluation and analysis.

However, it is important to note that this approach requires additional work and careful design to ensure its effectiveness. If not implemented accurately, it could have a negative impact on performance, so it is crucial to design and test the wrapper thoroughly to mitigate any potential performance issues.

As a final piece of advice, it is essential to remember to clean up your feature flags once the experiment or migration is completed. Although it may seem obvious, many developers tend to overlook this step. Removing unnecessary feature flags ensures a clean and organized codebase, avoids confusion, and prevents any unintended consequences that might arise from leaving unused flags in the code. So, always make it a practice to clean up your feature flags when they are no longer needed.

