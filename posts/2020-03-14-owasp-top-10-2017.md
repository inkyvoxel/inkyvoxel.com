---
title: OWASP Top 10 (2017)
description: The OWASP Top 10 is a list of the most critical security risks for web applications. It is important for developers to be aware of all the risks on this list to help prevent inadvertently introducing them in their software.
date: 2020-03-14
tags:
  - cybersecurity
---

The OWASP Top 10 list is created by the Open Web Application Security Project (OWASP), which is a nonprofit organisation that aims to improve web application security via education and training. The report is data driven and created based on evidence collected by OWASP.

OWASP aims to publish a top 10 list every 3 years, with the current report being from 2017, and the next one coming out some time after 2020.

Here are the top 10 risks from the 2017 report, ordered by most critical:

1. Injection.
1. Broken authentication. 
1. Sensitive data exposure. 
1. XML External Entities (XXE). 
1. Broken access control. 
1. Security misconfiguration. 
1. Cross-Site Scripting (XSS). 
1. Insecure de-serialisation.
1. Using components with known vulnerabilities. 
1. Insufficient logging and monitoring

## Why awareness is important

Preventing security risks being introduced in your software is incredibly important. Vulnerable software can be exploited by hackers, potentially allowing them to breach your systems. Once breached, hackers could steal sensitive data and disrupt your business. Not only would this be costly to resolve, it would be very damaging to your organisation's reputation, and your users would not be happy if their personal data was stolen from your website.

There are laws in place to hold organisations accountable for user data breaches, such as the General Data Protection Regulation (GDPR) in Europe. Your organisation could be fined a maximum of 4% of your worldwide annual revenue. In July 2019, British Airways had a data breach where customers' names, email addresses, and credit card information were stolen. For this breach, British Airways were fined £183m.

One of the best ways to prevent vulnerabilities being introduced to your system is by educating your developers. Give them time to learn, and pay for them to be trained by a subject matter expert. You should strive to create a culture in your organisation that makes security awareness an important part of software development.

Below is a brief summary of each security risk in the OWASP Top 10 from 2017 report.

## Injection

Injection can occur when hackers send data to your server that is not validated before it is interpreted by your code. If you have no validation, the hacker could potentially trick your code into running unexpected commands.

One of the most common occurrences for this type of attack against web applications is with SQL injection. This can happen when a hacker detects that your web application is using user input to change the behaviour of a SQL query, and instead of submitting values you expect (such as an ID or a search term), the hacker sends a malicious SQL query instead. And if you thought your NoSQL solution was automatically secure, think again, as NoSQL databases are vulnerable to the same kind of attacks.

As an example, imagine your web application allows users to search for members by putting a `MemberID` in a text box and submitting a form:

```python
# Take the member ID from the form submission and concatenate to our SQL query
sql_query = "SELECT * FROM Members WHERE MemberId = " + userInput
```

Instead of inserting a valid `MemberId` in the text box, the hacker could submit `1; DROP TABLE Members;--`, which would result in a SQL query that searches for a member with the ID of `1`, and also drop your Members table:

```sql
SELECT * FROM Members WHERE MemberId = 1; DROP TABLE Members;--
```

Many modern database frameworks have built in protection for this kind of attack, which is usually accomplished by using parameters that are automatically sanitised. Double check your framework of choice does this, otherwise you may have to sanitise all user input yourself.

Injection has been at number 1 spot on the OWASP Top 10 for a long time. Is it not the most common vulnerability (database frameworks are probably to thank for this), but if you application is vulnerable to this attack, it could have the biggest impact to your organisation.

## Broken authentication

Many web applications have user accounts that require a username and password to access. Some of these user accounts may have special administrative powers, which makes them prime targets for malicious users to try and take control of.

Unfortunately, people are terrible at creating strong passwords, and they often reuse passwords to make their lives easier. Hackers can easily get hold of lists of thousands (actually, probably millions) of known username and password combinations from other website breaches. They can then write an automated script to try logging into your web application with every username and password they have found to see if it works. This attack is called 'credential stuffing'. The hacker could also try a known username with thousands of different passwords to gain entry.

There are a few ways to help defend against these sort of attacks:

1. Implement multi-factor authentication on your website to stop users logging into accounts they don't own.
1. Detect and warn users when they are using bad passwords.
1. Limit the number of failed login attempts for individual accounts.
1. Try and detect users who are trying to log in with many different username and password combinations.

To help secure your own system, you need to help users choose better passwords. Make sure they are not using a password that appears in a 'most used passwords' list. You could also use the [haveibeenpwned](https://haveibeenpwned.com/) API to detect if the password they are trying to use has previously been breached, and prompt them to use a different one if so.

## Sensitive data exposure

Sensitive data exposure is when hackers gain access to unprotected user data from your website, which they could do in a number of ways. If data is breached, it will have a huge impact on your organisation, as users expect you to store their data securely.

To help prevent data exposure, you should:

1. Use strong encryption for all the sensitive data you store.
1. Have a valid SSL certificate on your website, and force all requests to go through HTTPS. This will help protect users that are visiting your website on compromised networks (e.g. public coffee shop Wi-Fi), which could have hackers inspecting their traffic.

You should also question if you need to store sensitive data in the first place, and have policies in place to delete old data when it is no longer required. If you do have a data breach, a policy such as this could lower the amount of user data you expose.

## XML External Entities (XXE)

XML External Entities (XXE) is a type of injection attack that exploits vulnerable web applications when they are processing XML.

XXE is a legitimate feature in XML, but what it can achieve when exploiting vulnerable web applications is mind blowing. When a malicious XML file is sent to a vulnerable web application, it can attempt to extract data from the server's file system or probe the server's network to try and scout out more vulnerabilities. When the web application has finished processing the XML file, it will send this exploited data back to the hacker in the application's response. If that wasn't crazy enough, XXE can even be used to attempt a denial of service attack on the web server processing the XML file.

Here is an example of an XML file that would try and extract `/etc/passwd` (a Linux file that stores sensitive user information) from a web server using XXE:

```xml
<?xml version="1.0"?>
<!DOCTYPE NotImportant
	[<!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<NotImportant>$xxe;</NotImportant>
```

Fortunately, many modern XML processing libraries have built in functionality to stop XXE attacks from happening. If you are using an old XML processor, you should make sure it isn't vulnerable. 

A better solution is to use a less complex data format such as JSON. Because of the popularity of JSON in modern web applications, I would be surprised if XXE stays at number 4 in the next OWASP Top 10 list.

## Broken access control

Access control usually limits user accounts to only viewing certain data or performing specific tasks, but broken access control allows hackers to use your web application in unexpected ways. A hacker may find a way to gain access to another user's data by changing a URL, which is referred to as an Insecure Direct Object Reference (IDOR).

To prevent this being exploited, you need to ensure that your application authenticates and authorises users correctly when they are accessing functional endpoints.

## Security misconfiguration

Security misconfiguration is one of the most common risks for web applications. It is a catch all category for any misconfigured operating system, framework, library, database, etc.

These misconfigurations can be detected by automated tools and scripts, making them easy to find and fix, or to find and exploit if you are the hacker.

## Cross-Site Scripting (XSS)

Cross-Site Scripting (XSS) occurs when you web application allows hackers to add custom JavaScript into the path of an URL, or directly onto your website, and then have that code execute when legitimate users browse your website.

Similarly to injection, if you are taking user input directly from query strings or form submissions, and concatenating this input straight into your JavaScript, then your website might be vulnerable to XSS attacks.

Imagine your website allows search terms to be added to the query string, such as `/search?query=books` when searching for 'books'. On the page load you use JavaScript to display the search term on the page:

```html
<p>Showing all results for 'books'</p>
```

If your JavaScript code takes the query string and uses the value without sanitising first, a hacker could encode malicious JavaScript into the URL that would end up on your website:

```
/search?query=books+%3Cscript%3Emalicious_code()%3C/script%3E
```

The above example would result in the following being loaded on your website:

```html
<p>Showing all results for 'books <script>malicious_code()</script>'</p>
```

Hackers could send this URL to your legitimate users via email, or post it on social media. When your website loads, `malicious_code()` would run on the legitimate user's web browser.

XSS vulnerabilities are very commonly found on the internet, but fortunately more web applications are being built with modern JavaScript frameworks that have built in protection for XSS.

There are many automated tools available that can detect XSS vulnerabilities (which are also used by hackers). You and your developers should be using them to find and fix any vulnerabilities found.

## Insecure Deserialisation

Insecure deserialisation can be exploited when you web application deserialises data sent from an untrusted source. This is becoming a more common risk, as more developers are building complex frontend applications that rely on sending objects back to an API backend.

Hackers will try and embed malicious code inside of the data objects that they are sending to your server. If your web application deserialises the object and executes their code without validating first, it could allow the hacker to achieve Remote Code Execution (RCE) on your web server. They could also send malicious code to just crash your web server.

It is also common for hackers to change the values inside the data object that they are sending to your web server. They might try and do this to escalate their user privileges on your website, or try and access data that they are not supposed to have access to. Because of this, your code should try and verify if data objects have been tampered with or not.

## Using components with known vulnerabilities

Most web applications are built using third party libraries or frameworks. If hackers find security issues in particular versions of these third party components, they will try and find websites that are using them so that they can exploit the vulnerability.

Hopefully you are using an actively developed component, where the developers frequently release updates to address known bugs and security issues. You need to do your part to actively check if the components you are using are vulnerable, and update them accordingly. If you and your development team are not in the habit of doing this, you are potentially leaving your web application open to exploits.

The same applies to operating systems, web servers, databases, and pretty much any software you are using that makes your web application operate. As a best practice, you should try and keep everything up to date.

There are tools and services available that can automatically detect if the components you are using have known vulnerabilities. You should look into using these as part of your continuous integration pipeline, and fail your builds if any vulnerable components are detected in your code base.

## Insufficient logging and monitoring

If you do not have sufficient logging or monitoring, you might have already been breached and you would not know. Various studies have reported that on average, it takes companies almost 200 days to detect they have been breached.

You need to log events such as failed attempts to log into your systems, access control failures, and server side input validation errors. Your logs need to be in a format that is easy to read, and accessible from a centralised logging system. Most importantly, people need to check the logs. If the logs are too noisy it is going to make it hard to spot potential issues. 

To help detect when you are under attack, you should set up automated systems that raise alerts to your on-call team when certain events arise, such as high volumes of failed login attempts.

## Closing thoughts

Vulnerabilities in your software are bad news. Hackers can exploit vulnerabilities to breach your systems, disrupt your business and steal sensitive data. Every developer in your organisation should be aware of the risks in the [OWASP Top 10 report](https://owasp.org/www-project-top-ten/), as awareness is one of the best ways to prevent vulnerabilities being introduced in the first place.

Just remember that this is only a top 10 list, and there are many other potential security risks that hackers can exploit. The OWASP Top 10 2020 report should come out soon, and it will be very interesting to see if there are any new trends for web application security.