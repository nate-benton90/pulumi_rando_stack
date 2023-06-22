import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"

// BASH user data for EC2 (below) - will delete and create new EC2 for 
// any change. It's recommended to destroy and re-create the stack
// if a change occurs here.
const userData = 
`#!/bin/bash
echo "***Act 1: Docker setup"
sudo mkdir -p /home/ec2-user/
cd /home/ec2-user/
sudo yum update -y
sudo yum -y install docker
sudo service docker start
sudo docker version
sudo docker pull python

echo "***Act 2: App setup"
echo "What does 'Alea Iacta Est' mean anyway...?" > index.html
echo "<form action='https://en.wikipedia.org/wiki/Alea_iacta_est'>" >> index.html
echo "<input type='submit' value='Follow me down the rabbit hole...'/>" >> index.html
echo "</form>" >> index.html
ls -lah

echo "***Act 3: Mount file to container and run app"
sudo docker run --name fairwinds-webserver-app-main --expose 8080/tcp --publish 8080:8080 --mount type=bind,source=/home/ec2-user/index.html,target=/index.html -td python
sudo docker exec -d fairwinds-webserver-app-main nohup python3 -m http.server 8080 &`;

// VPC module usage and config.
const vpc = new awsx.ec2.Vpc("fairwinds-foo-simple-vpc", {
  cidrBlock: "192.168.1.0/26",
  numberOfAvailabilityZones: 1,
  subnets: [{ type: "public" },
            { type: "private" }],
});

// Security group RESOURCE setup.
const group = new aws.ec2.SecurityGroup("fairwinds-webapp-sg", {
  description: "allow incoming world http traffic",
  vpcId: vpc.id,
  ingress: [{
    fromPort: 80,
    toPort: 80,
    protocol: "tcp",
    cidrBlocks: ["0.0.0.0/0"],
  },
  {
    fromPort: 8080,
    toPort: 8080,
    protocol: "tcp",
    cidrBlocks: ["0.0.0.0/0"],
  },
],
  egress: [{
    fromPort: 0,
    toPort: 0,
    protocol: "-1",
    cidrBlocks: ["0.0.0.0/0"],
  },],
  tags: {
    Name: "allowHttpWorld",
  },
});

// EC2 setup.
const server = new aws.ec2.Instance("python-webapp-ec2", {
    instanceType: "t2.micro",
    subnetId: pulumi.interpolate`${vpc.getSubnetsIds("public")}`,
    vpcSecurityGroupIds: [ group.id ],
    ami: "ami-021d41cbdefc0c994",
    userData: userData,
    tags: {
      Name: "fairwinds-docker-app",
      AppType: "docker-python"
    },
},
{ dependsOn: [ vpc, ],},
);

// Export variables for console print and use for other files.
console.log("\n\n***EC2 network info below:")
export const publicIp = server.publicIp;
export const publicHostName = server.publicDns;
