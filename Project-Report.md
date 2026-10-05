# KTGbibliotek \- DevOps report

## 1\. Architecture and processes

KTG Bibliotek is a library web application, built with Next.js, React, and TypeScript. It uses Firebase for both data storage (Firestore) and Hosting. Around this application, we implemented the core DevOps techniques required for this assignment

### Continuous Integration

For the ci pipeline (ci.yml) we used the GitHub Actions workflow. It consists of three different jobs, lint, unit-tests and integration-tests, so that failure in one can be immediately distinguishable. The lint job runs ESLint, the tests run our Jest suite with both unit-tests and integration tests. Lint and the tests are independent, but to run integration tests, the unit-tests and lint need to pass. The integration test checks that our security rules work as they should since they are the most important. They also test the frontend integration in one of the forms. 

For the unit tests, all Firebase calls are mocked so that the tests run without network access and are quick, so that we can find errors in the code logic quickly.

### Continuous Deployment

A second workflow (cd.yml) is triggered via workflow\_run once the CI pipeline completes on main, and only proceeds if the CI’s conclusion was a success, meaning that we won't deploy if the tests fail. We did this because we don’t want to deploy broken code. It builds a static export of the application and deploys to Firebase Hosting using the FirebaseExtended/action-hosting-deploy action.

### Infrastructure as code

A Terraform configuration manages three resources directly: The Firestore Database, Firestore security rules and the Firebase Hosting site. These were brought under Terraform by importing the already existing resources rather than creating them fresh. The Terraform state is local; see the limitations of this in section 2\. 

### Development platform

GitHub hosts the repository, with branch protection on main requiring the CI check to pass before a merge is permitted. It is also not allowed to push to main without opening a pull request. 

### Quality and security automation

ESLint runs as static analysis in the CI pipeline.  Dependabot is configured for automatic security updates, opening pull requests when a dependency has a known vulnerability. These PRs are gated by the same CI pipeline before merge. GitHub secret scanning is enabled on the repository.

## 2\. Justification of key design decisions

### Automated tests and when they run

We run lint and unit tests on every push (all branches) and pull requests (only to main), so that we can spot issues early. The integration tests are more expensive to run, so we decided to keep them only for pull requests and pushes to main. The trade-off we make when doing this is that an issue might be spotted a bit late if a branch has a lot of commits. But we figured that PRs should not have that many commits, so it should be easy enough to trace back.

### Static export over server-side rendering.

The application has no API routes and no server components. Every data operation goes through the Firebase client SDK directly from the browser. Static export therefore loses no functionality while significantly simplifying deployment. No server runtime to configure, scale or secure, and Firebase Hosting serves the built output as plain static files.

The application calls one external API directly from the browser (Libris, for ISBN lookups), but it doesn’t require a server of its own and is therefore unaffected by static export.

### Separate CI and CD workflow files, gated by workflow\_run

Since we wanted the CI pipeline to run more often than the CD pipeline, we decided to keep the CD pipeline in a separate file so that we could configure it to what we wanted. The trade off for this was that we needed to use workflow\_run rather than the simpler needs: keyword available in one single file. It was also a lot clearer and more readable to keep them both separate.

### Firebase Hosting over Vercel

Vercel offers zero-configuration deployment for Next.js, and would’ve required no GitHub Actions workflow at all since it happens outside of GitHub. Firebase Hosting keeps the deployment step visible in the repository, and keeps both the application’s data and hosting layer on the same platform, which is also what the IaC configuration manages, rather than splitting infrastructure across two unrelated providers for no functional benefit.

### Terraform scope: Firestore, Hosting and local state

We brought the Firestore database, its security rules, and the Firebase Hosting site under Terraform management, since these are the resources whose misconfiguration carries the most direct consequence. The security rules determine who can read or write user and catalog data. The Hosting site is the deployment target our entire CD pipeline depends on existing correctly.

We tried moving Terraform's state to a remote GCS backend, but bucket creation requires a linked billing account, which our Firebase project doesn't have on the free Spark plan (we shouldn’t have to add it). We also considered Terraform Cloud, but that would mean managing another separate account and service just for this one piece. The trade-off for this is that the state won’t be synced between developers, so any update made locally by one person isn't automatically visible to anyone else. If a teammate runs Terraform for the first time on their own machine, they'll start with an empty state file even though the real resources already exist; they'd need to import every resource manually before Terraform recognizes it, exactly as we did ourselves. 

An unimported database fails safely on creation (Google's API rejects the duplicate); prevent\_destroy specifically guards the more dangerous case, an already-imported database being destroyed by a later configuration mismatch.

However, given the application’s scope and team size, local state works just as well, and trying to get the state into the cloud is not worth the overhead. Changes to the configuration are also extremely rare in this particular application’s case. So it is just about making sure everything exists.

### Dependabot security updates

We set up Dependabot to only alert us about security vulnerabilities, not every new version that comes out. The reasoning is that a security patch is something we actually need to apply quickly, while a regular version update isn't urgent and can easily break something if not careful.

The trade-off is that the versions won’t be updated, but we consider this minor unless there is a new feature or functionality added that we need. The only concern is security and vulnerabilities, which we have covered with security updates.  It is also never recommended to update immediately after a new release since there might be an undiscovered vulnerability in the new version. So keeping the application on a secure one is always the best option.

## 3\. How Components interact

Pushing to a feature branch or opening a PR to main runs the CI’s lint and test jobs (integration runs only on PRs). Both have to pass before merging to main is allowed. Once merged and all tests passed The CD pipeline is activated and builds and deploys the app automatically to Firebase Hosting.  
Dependabot works separately, it scans the repo for vulnerabilities. When one is found Dependabot creates a PR which goes through the same CI checks as any other change.  
Terraform runs on its own, outside the pipeline. It manages the firestore database, the security rules the app’s reads/writes are checked against and the Hosting site the CD pipeline deploys to. The pipeline assumes these already exist and terraform guarantees that.

## 4\. Limitations and trade-offs

The main trade-offs that we have are: local Terraform state, security-only Dependabot updates, separate CI and CD workflow files, and PR and main-only integration tests, which all are discussed in Section 2 alongside the decisions that caused them.

## 5\. AI Usage 

In this project, we mainly used AI as a helper for spell checks and debugging. All DevOps setup and configuration were done manually by us. This includes CI/CD pipelines, test suite, Terraform, and GitHub configurations. After setting up the test suite and writing the first few tests ourselves, we used AI to help us create additional tests following the same pattern. We reviewed and ran these tests to make sure they worked properly. 

We made this decision because this assignment is about DevOps practices and not the application itself, the tests mainly serve to give the pipeline something meaningful to do. Because the application is under continuous development and its code still changes, a larger test suite is useful for that purpose. Another reason was that only one of us is developing this application continuously, and therefore the other doesn’t know every part of the application code in detail, so AI was useful here.

Encountering bugs can be frustrating, so to save some time, if we couldn’t spot the issue ourselves, we asked AI for guidance. We especially did this when Dependabot’s security updates caused issues with our test suite. 