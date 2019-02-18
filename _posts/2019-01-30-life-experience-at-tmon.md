---
title: My Work Experience at TMon (TicketMonster)
categories:
 - life
tags:
 - life, work, experience, programming, developer, korea, IT, company, microservice, monolithic
---

I would like to share my experience working as a developer at TMon (TicketMonster), one of the top Korean E-commerce company. Originated back in 2010 by five guys as a startup, where only two of them were developers. I think the story of TMon can be considered one of the successful stories. Even though I have not worked for long (1 year and 13 days saying exactly) to judge it is good company for developers. (<-- for TL;DRs)

# Interview

There were two interviews since I had an internal referer. I think for people without referer there will be additional online coding test. First on-site interview was with two senior developers. One of them was the head of the lab (service lab) who started asking me about my backgrounds. After listening to me they have given me a programming test (can't remember exactly but it was primitive one). At that time I haven't used java for a quite a bit, so I excuse myself for not remembering exactly functions (str.length or str.length() ). They have accepted my appology and let me concentrate on solving the problem. Then head of the lab started asking me a questions regarding to service layer. How would I solve the scaling problem and how would I use pub-sub services in order to solve the service layer problems. At that time I had an experience with MQTT server, so I draw the archicture how i would solve the scalability problem with it. Anyway at that time I came from the research area where of course we do study those things not in details (especially when you come from more like embedded software world). But somehow they have decided I could catch up. They gave me pass and after 1~2 weeks I had to have an interview with the CTO. CTO (이승배) at TMon was/is extra-ordinary guy, so I would like to talk about him in detail later. He asked me about my back-projects I have tried to explain him what I did in my previous job, explained the project I did and which part of it I did. After having an interview with CTO right away I had to have a third-eye interview, which is more like psychological interview. I had a conversation with the guy who were more familiar with TMon culture. It was just a friendly talk, he asked me about my life and experience, I asked him about TMon culture.  

# First Impression

The recruiter guy from HR team met me at the lobby and brough me to the CTO department. We have signed the contract and some confidentiality related documents. Soon after I have met with head of the lab, and he lead me to my sit. Met with my team mates and received welcome package gifts. Windows PC and Macbook was waiting for me with default password. First of all I have reset the password on my PC which is bound to AD (All development environment related services are bound to this AD password).

Welcome Packages
![welcomePackage](/assets/images/tmon/welcomePackage.jpg)
![welcomePackage2](/assets/images/tmon/welcomePackage2.jpg)
![welcomePackage2](/assets/images/tmon/nameTag.jpg)

My Computers
![welcomePackage2](/assets/images/tmon/mySit.jpg)

CTO Department (photo has been taken early in the morning)
![welcomePackage2](/assets/images/tmon/tmonLab.jpg)


There is a coffeshop at the basement which is selling coffee and other drinks with a quite a cheap price. As I know it was part of the welfare, so the company covers half price of our coffee. 

# One Week Study

TicketMonster (TMon) is a big ecomeerce company in Korea. They have the whole infrastructure not for IT but also for their own warehouses and delivery systems. So there is one week study for any newcomers. During that week we are getting familiar with the company structure and head of the departments are coming and presenting us what they are doing in their deparment. It was really intersting week. At last two days we visit call-center and warehouse. 

## Call-Center

![welcomePackage2](/assets/images/tmon/callCenterWholeView.jpg)
![welcomePackage2](/assets/images/tmon/callCenterService.jpg)

At the call-center we were attached with a call receiving person who does their job very professionaly to handle the clients who are calling with various kinds of problems. 15 minutes listening to the talk was more than enough to understand how difficult their job is.

## Warehouse

![welcomePackage2](/assets/images/tmon/carsAtWarehouse.jpg)
![welcomePackage2](/assets/images/tmon/tmonWarehouse1.jpg)
![welcomePackage2](/assets/images/tmon/tmonWarehouse2.jpg)

Even though Warehouse job was quite fun for me, most other guys didn't like it much. I'm not sure about how other companies are doing it but TMon had very good introduction week, where we could get a glimpse of sense what the company was doing.

# Culture

Even though the company has been found in 2010, they have decided to keep the startup culture. Everyone is nice to each other, and everyone tries their best to do best what they are doing. Totally there were around two thousand workers among which two hundered were from CTO department (developers, QA and infra team members). There was a culture team who was always try to organize good and interesting events for the company people. There were only 4 people but, they worked really hard, so I personally felt like whole big department was working on that team. They even have a [TMon-TV](https://www.youtube.com/channel/UCFwxRuQm71R_terxjlp0aoA) which is running for the internal usage showing the news and events that are happening inside the company.

Events are well organized in the company, for example 2018 we have visited the Seoul Land park and had birthday event of the company there, it was very fun with a lot of popular K-pop artists visiting.

![welcomePackage2](/assets/images/tmon/tmonParty1.jpg)
![welcomePackage2](/assets/images/tmon/tmonParty2.jpg)


## Study Groups

Company encouraged us to organize a study groups related to our work and interest. Yes it sounds tricky but it was almost free topic study. Because once we organized the blockchain study group which had no relationship to our actual work. Thats where I have learned details of ethereum and how it works. Company provided us with a book related to the study and money so once in a month we could have a lunch togethere with study members. Oh right they have also provided us with coffeshop tickets. During my one year at Ticketmonster I have participated in four study groups: Spark Machine Learning, Blockchain technologies with Ethereum, Hyper-ledger, Algorithms. 

![welcomePackage2](/assets/images/tmon/tmonStudyGroup.jpg)

## Hobby Groups

Company allows to register to some existing hobby groups such as football, basketball, golf, marathon, skuba-diving, lego making, robot model making, growing a flower, novel book reading and many others I can't recall. Also they are open for the new options if you would like to organize your own hobby group. Only thing what you need is clearly define what is your hobby about and find minimum 10 people who would participate in your hobby group. Hobby groups are provided with 20`000 KWN/person per month. If you plan it up you can spend it quite wisely for your hobby. 

# CTO

CTO department where actually I have worked as a Backend Developer deserves to have separate blog about it. But I will try to be short about it. TLDR; it was healthy culture (that can compete with Sillicon Valley companies) with completely Microservice Architecture at the software level as well as organizational structural level. I think [Conway's Law](https://en.wikipedia.org/wiki/Conway%27s_law) is completely satisfied in this company. All thanks to current CTO SeungBae Lee (이승배), who less than in a three years transferred the whole system from Monolith to MSA. Beafore I came to the company there were were following teams: Infra-team, QA-team and Service-team, Standardization-team, mobile-team, fontEnd-team, datascience-team. When I came the teams have started changing into cells. Where combination of the different members are merged together to work on specific service.

Main programming language is Java, but polyglot developers are also welcomed to apply because there are some services are developed on NodeJs. DataScience team uses python, Android and iOS developers uses their prefered platform languages. Cells are working with planners in close interaction.

Security and Privacy related issues of the whole system is well organized (cannot give details about it here). All user private datas are encrypted and not available to see from DB. DataScience team works hard on collected BigData logs to improve the service to the end users.

Twise in a month we were allowed to work remotely from home by connecting through VPN. All activities were registered and tracked by portal of the TMon, which was also constantly changing by our requests.

# HR-Team

HR team had very propfessional workers who knew their job very well. From the first till the last day of mine at the company, they have approached their work very professionaly and respectfully. Without involvement of any negative emotions. Some of the HR memebers speak English very well, but most of them were speaking Korean language only.

Four times in a half year we are allowed to use Super-pass, which is 2-hour vacation. At the first it looks something weired but it helped a lot when suddenly you have some appointment. So you could leave the work 2 hours earlier or come late to work.

One of the best sport centers (Located at the KT&G building) at Gangnam area were on our service. It contains all kind of GX excersises, sauna and spa. 

# Conclusion
As a conclusion I would like to recommend TMon for developers. I cannot surely say what exactly goes on at the other deparments, but with current CTO of the company is best place for the developers.

