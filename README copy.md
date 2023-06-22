 # Fairwinds deliverable (and a somewhat cryptic title)

 ## Section 1: Requirements and/or expectations
 1) Pulumi software/CLI (this works with `v3.32.0`).
 2) Valid aws CLI credentials and configuration (this works with this setup: `aws-cli/2.4.5 Python/3.8.8 Windows/10 exe/AMD64 prompt/off`).
 3) You have `npm` (tested and working with version `8.5.5`).
 4) You have a Pulumi account (for state MGMT) and are logged in.
 5) An internet connection :grinning:.

 ## Section 2: How/why I did what I did for this work
 1) There are many ways of doing this. Honestly, at first I thought I'd do Terraform+Ansible, but I just really wanted to do the whole TS+Pulumi thing
 because it's been a while.
 2) For the app section, what I did was painfully basic and that could certainly be improved by integration of the following sources and/or workflows: pulling a custom (locally developed and pushed) image from Docker Hub (or ECR, which wouldn't have worked for this anyway), setting up a local-to-EC2-to-Container SSH connection to (for example) `scp` a local application script to the running container for the webserver, etc.
 3) Overall, a lot of this work was (as it usually is) was find, copy, and reconfigure from the sources I list in Section 3 (below).
 4) Going back to Point #1, we could have done this in Python or Go or mulitple other ways. For what it's worth, I'd try to use Go for the next iteration so I learn that better for this type of scenario.
 5) Simple functionality was the aim for this whole setup. It definitely needs enhancments, fixes, etc., which is all described in Appendix 2.

 ## Section 3: Assumptions
 1) Everything from Section 1.
 2) You are using the same AWS account (and region) as I did.
 3) You are using a (working) AWS profile from your local (global search for `---` to replace with your name).
 4) You have reviewed start to finish all IaaC and comments therein.

 ## Section 4: Deployment tutorial
 * Before starting this, it's required that you have at least completed Sections 1-3.

  1)  Pull from GitHub repo (joking, looks like you've already done that)
  into an empty directory.
  1)  Ensure you are using the single feature branch (there's no other anyway and this needs to be examined by others before creating/rebasing with `main`). As another side-note, I'd like for the review to act moreso like a PR, so once we understand and have (hopefully) and working "dev" branch, then creating and merging (or rebasing) this with `main` seems like a good idea.
  2)  Run `npm install`.
  3)  Run `pulumi up -y` (this will take at around 3-5 minutes). Allocate enough time for the user data to finish for the EC2 (until the console system log generates output, the server will not be ready for communication).
  4) Wait for Pulumi output in console for IPs (and even longer for #3 to complete).
  5) Try from terminal `curl http://<IP>:8080 -v`.
  6) To tear everything down, use `pulumi destroy -y`.

-------------------------------------

 ## Appendix 1: Sources
 1) [EC2 webserver tutorial](https://www.pulumi.com/registry/packages/aws/how-to-guides/ec2-webserver/).
 2) [Pulumi docs for EC2](https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/).
 3) [Pulumi docs for Crosswalk (i.e. reusable modules)](https://www.pulumi.com/docs/guides/crosswalk/aws/).
 4) [Running ("rootless") Docker](https://docs.docker.com/engine/security/rootless/).
 5) [Python App HTTP docs](https://docs.python.org/3/library/http.server.html).

 ## Appendix 2: An exhaustive, enumerated list of why this deliverable is "bad"
 1) File structure and allocation of resources (i.e. don't put everything - at least in terms of the IaaC - in a single file).
 2) Use Pulumi's native dynamic resource provider instead of the poor implimentation of how I ran the user data (BASH) script.
 3) No semblance of a useable, automated, and flexible CICD process (via GitLab runners, GitHub actions, etc.).
 4) The commit history is unruly in the senese that the PR was too large and should have been condensed into smaller tasks (for merge to master/main).
 5) There should be an automated task MGMT system for all development branches (can I hear it for Jira integration). What I mean by this is something like after pushing a new branch (e.g. `feature/STORY_ID-foo`), that automatically becomes associated with the meta-data for that Jira object (i.e. task, story, bug, ...).
 6) No tagging in Git, which should be used.
 7) The way the AWS profile is configured for this project is not flexible. Not sure what was causing the issue on my end but I stuck with the workflow shown above. I'd much rather have `aws.Provider`  being used to make that whole obligatory process seamless.
 8) We're using HTTP? Yikes, that's about as bad as something like an FTP server. It gives me heartburn thinking I've willingly done this. Of course for the host machine (i.e. EC2) and running container, auth and networking accessibility would be really "locked down" as well as closely monitored IRL with cert MGMT through things like Let's Encrypt, modified SGs, etc.
 9) It can't ephasize this enough: it is a terrible, hazardous idea to be doing anything with the Docker runtime with `su`, so that must be changed to a custom user with least priviledge.
 10) There should be (at least with part of the user data) some command with running basic update commands for regular OS packages.
 11) There's literally no unit testing going on here, and that's super, super poor form. It's been many moons since doing stuff with TS, but I think that's through Mocha. Per usual, Pulumi has an example [here](https://www.pulumi.com/docs/guides/testing/unit/).
 12) Everything (i.e. all the IaaC) is just bunched into a single TS file. That's fine for incredibly small, simple architecture, but quickly becomes unruly after a while. In my experience, the best way to manage this is to allocate resource types to corresponding files (e.g. all EC2s Instances in a single `ec2Instance_foo.ts` file, likewise, all Security Groups in a `sg.ts` file).
 13) There are way too many hard-coded strings that should be abstracted.
 14) Not desgined for seamless multi-account deployments.
 15) Failure to impliment, uphold, and standardize an easy-to-understand naming convention for basically everything.
 16) Not form of error catching/handling for the BASH script.
 17) The EC2 depends upon attribute. That's lazy and not sustainable, especially in the context of the corresponding comment in the code.

 ## Appendix 3: Funny things I thought of while conducting this work
 1) The most unsettling but equally amusing thing I've ever encountered in a README file went something like, "Caution moving forward, there be dragons here..."
 2) I probably spent more time on getting my local profile auth configured than actually building stuff and resolving the debacle with getting the SubnetId from the Pulumi TS promise thing. C'est la vie.
 3) I chuckled really hard when I was like, "Oh, time to create literally everything associated with useable and functioning VPC networking architecture."
 4) Whoa. I shoulda known. Of course they retains modules for quick, simple stuff like this. Praise Pulumi and disregard #3. It's been a while.
 5) I spent way too much time on this README.
 6) Testing out the EC2 user data portion took way too long.
 7) I remember doing Pulumi state file manual edits sometimes. That was painful.
 8) A huge mistake I made while doing this was to have two directories working on the same stack but with different states I that were not synced, which caused a lot of issues I didn't notice until later.
 9) All issues with not being able to make this work relates back to latest commits whereby the outbound SG for the EC2 Instance failed to create by default. So, everything is failing because of that.
 10) Indeed, I spent much more than 3 hours on this work. If that disqualifies, understood. I wasn't going to stop until it worked :stuck_out_tongue:.
