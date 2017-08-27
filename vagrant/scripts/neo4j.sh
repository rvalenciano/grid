cd;
# Neo4j requires java
# sudo apt install default-jre default-jre-headless -y
# sudo update-alternatives -set java /usr/lib/jvm/java-8-openjdk-amd64/bin/java
# sudo update-alternatives -set javac /usr/lib/jvm/java-8-openjdk-amd64/bin/javac
sudo wget --no-check-certificate -O - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
sudo add-apt-repository ppa:webupd8team/java -y
sudo apt-get update -y
echo debconf shared/accepted-oracle-license-v1-1 select true | sudo debconf-set-selections
echo debconf shared/accepted-oracle-license-v1-1 seen true | sudo debconf-set-selections
sudo apt-get install oracle-java8-installer -y
sudo rm /var/cache/oracle-jdk8-installer/jdk-*
sudo apt-get install -f
sudo dpkg --configure -a
sudo su
echo 'deb http://debian.neo4j.org/repo stable/' >/etc/apt/sources.list.d/neo4j.list
exit
sudo apt-get update -y
sudo apt-get install neo4j -y
service neo4j status
# to accept connections from host
sudo echo "dbms.connectors.default_listen_address=0.0.0.0" >> /etc/neo4j/neo4j.conf
sudo echo "dbms.connector.bolt.address=0.0.0.0:7687" >> /etc/neo4j/neo4j.conf

sudo service neo4j restart
vagrant ssh -c 'curl localhost:7474'
vagrant ssh -c 'curl -H "Content-Type: application/json" -XPOST -d \'{"password":"grid2017"}\' -u neo4j:neo4j http://localhost:7474/user/neo4j/password'