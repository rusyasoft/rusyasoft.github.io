---
title: Architecture Is Becoming Part of the Implementation Process
date: 2026-07-11
categories:
  - software-engineering
  - architecture
  - ai
tags:
  - ADR
  - Architecture Decision Record
  - Agentic AI
  - LLM
  - Proof of Concept
---

Designing software architecture and writing an Architecture Decision Record—or ADR—is not an easy job.

Despite all my years of experience and all the architecture books I have read, I have always found this part of software development difficult.

Maybe it is related to my personality. I am usually in a hurry. I want to move fast and reach the destination as soon as possible.

But whenever I design a new system, many questions immediately appear in my head:

- Will this actually work?
- How will the components communicate?
- What will the performance look like?
- What problems will appear during implementation?
- Are we choosing the right technology?

Years ago, before the current AI advancements, I often tried to answer these questions by building small Proofs of Concept.

Sometimes, I spent extra hours creating those prototypes. Other times, I gave parts of the investigation to junior developers and worked with them to test different approaches.

The feedback I occasionally received from senior engineers or professors was that I should trust my experience more.

They would tell me that architecture is not the implementation stage. We would have enough time later to build the system, discover the problems, and make adjustments.

Their point was understandable.

Creating a prototype for every architectural question can become expensive. At some point, an architect has to make decisions based on experience, existing knowledge, constraints, and reasonable assumptions.

But I always had difficulty promising something without knowing whether it would work.

Even worse, I did not want to make a confident architectural decision and later discover that the team could not deliver it.

## Architecture Was Painful, but Implementation Was Easier

As a result, the architecture and design period was usually painful for me.

I would investigate, experiment, and think about many possible failure scenarios. It sometimes felt like I was already implementing the system before the implementation had officially started.

However, there was also a benefit.

Once the architecture phase was complete, I usually had a working prototype both in my mind and, at least partially, in the code.

The rest of the development process became much more enjoyable. Instead of wondering whether the main idea would work, I could concentrate on strengthening the solution, handling edge cases, improving reliability, and helping the team implement it properly.

In other words, I was spending more effort at the beginning to reduce uncertainty later.

## AI Is Making Proofs of Concept Cheaper

With the advancement of LLMs and agentic coding tools, I have started enjoying the architecture process much more.

The main reason is simple:

**Proofs of Concept are becoming cheaper.**

Today, I can describe an architectural option to an AI coding agent and ask it to create a small implementation.

I can then try another option.

And another one.

I can compare them, run tests, inspect the code, identify limitations, and throw away the approaches that do not work.

This does not mean that AI makes the architectural decision for me.

It means AI helps me collect evidence before I make that decision.

Previously, testing three architectural options could take several developers many days. Because of that cost, we often discussed the options theoretically and selected one based mainly on experience.

Now it is increasingly possible to build small versions of those options and compare something real.

## Does Architecture Still Need to Be a Separate First Step?

This change made me think about a bigger question:

**Do architecture and implementation always need to be completely separate steps?**

The traditional process often looks like this:

1. Design the architecture.
2. Document the decisions.
3. Approve the design.
4. Start implementation.
5. Discover which assumptions were wrong.

But with cheaper experimentation, the process can become more iterative:

1. Think of an approach.
2. Build a small version.
3. Evaluate it.
4. Learn from the result.
5. Try another approach when necessary.
6. Record the final decision.

Architecture does not disappear in this process.

It becomes more connected to implementation.

Instead of treating architecture as a document that must be completed before coding begins, we can treat it as a process of reducing uncertainty through thinking and experimentation.

## ADRs Can Record Evidence, Not Only Predictions

Last week, I came across an interesting article by Garry Shutler called [“ADRs in a post-flip world”](https://gshutler.com/2026/06/adrs-in-a-post-flip-world/).

The article made me realize that I am apparently not a caveman and may even have some ability to think.

Jokes aside, Garry describes a similar change in how his team uses Architecture Decision Records.

Traditionally, an ADR was often written before implementation.

The team would describe several possible approaches, discuss their expected advantages and disadvantages, choose one, and then begin building it.

In this model, the rejected alternatives were usually ideas that the team had discussed but never actually tested.

Agentic coding changes the economics of this process.

When small implementations are cheap, the alternatives described in an ADR can be real prototypes rather than theoretical options.

Instead of writing:

> We believe option B will be too complicated.

We can write:

> We built a small version of option B and discovered these specific complications.

That is a much stronger architectural decision.

The ADR format itself does not need to change very much. It can still include:

- Context
- The final decision
- Considered alternatives
- Consequences
- Trade-offs

What changes is the evidence behind the document.

The ADR becomes less of a prediction and more of an actual record of what the team learned.

## Humans Still Own the Decision

There is one important boundary.

An AI agent can help us:

- Build prototypes
- Run experiments
- Compare implementations
- Summarize findings
- Draft the ADR

But humans still need to own the important parts:

- What problem are we actually solving?
- What criteria matter?
- Which trade-offs are acceptable?
- Which risks are we willing to take?
- Which option fits the long-term direction of the system?

An agent can produce code very quickly, but fast code generation is not the same as architectural judgement.

If we do not define proper evaluation criteria, we may simply choose the prototype that looks the most complete or was generated the fastest.

The purpose of experimentation is not to avoid thinking.

It is to support thinking with better evidence.

## My Current View

I no longer see architecture as something that must always be finished before implementation starts.

For many decisions, architecture can happen through implementation.

We think about an option, create a small prototype, evaluate it, and update our understanding. After exploring the strongest alternatives, we document why we selected one of them.

This approach fits naturally with the way I have always preferred to work. The difference is that AI now makes the experimentation much faster and less painful.

Maybe trusting your gut is still important.

But when testing your gut becomes cheap, why not test it?

The most valuable use of AI coding agents may not be writing the final production code faster.

It may be helping us make better decisions before we commit to that code.

![Traditional ADR workflow compared with an AI-assisted, evidence-based workflow]({{ '/assets/images/architecture-implementation/01-core-idea.png' | relative_url }})

![Architecture decisions supported by working implementation spikes]({{ '/assets/images/architecture-implementation/02-implementation-as-decision-making.png' | relative_url }})

![A workflow where the ADR is written after exploration and evaluation]({{ '/assets/images/architecture-implementation/03-adrs-move-later.png' | relative_url }})

![Cheaper experimentation can create stronger, evidence-based architectural decisions]({{ '/assets/images/architecture-implementation/04-cheaper-experimentation.png' | relative_url }})

![Evaluate architectural options from both the implementation and consumer perspectives]({{ '/assets/images/architecture-implementation/05-evaluate-consumer-side.png' | relative_url }})

![AI agents can draft ADRs, but humans remain responsible for architectural judgement]({{ '/assets/images/architecture-implementation/06-agents-draft-humans-judge.png' | relative_url }})

![ADRs preserve architectural context for future engineers and AI coding agents]({{ '/assets/images/architecture-implementation/07-adrs-preserve-context.png' | relative_url }})

![The ADR format remains familiar while the evidence behind it becomes stronger]({{ '/assets/images/architecture-implementation/08-what-has-not-changed.png' | relative_url }})

![A practical workflow for evidence-based architecture using AI-assisted prototypes]({{ '/assets/images/architecture-implementation/09-practical-workflow.png' | relative_url }})
