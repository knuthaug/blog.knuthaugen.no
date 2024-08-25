--- 
layout: post
title: Comparing MongoDB java frameworks
mt_id: 32
date: 2010-07-28 11:13:34 +02:00
tags: [NoSQL, MongoDB, Java]
---

I while ago I gave a talk at a Oslo JavaBin meeting on NoSQL and in the research for that I wounded up writing some sample code for three different frameworks for using [MongoDB](http://www.mongodb.org/) from Java. The code is [available on GitHub](http://github.com/knuthaug/mongodb-samples/tree/java). The three are the 10Gen mongo driver (and not really a framework), [morphia](http://code.google.com/p/morphia/) and [mungbean](http://github.com/jannehietamaki/mungbean).

### The Whole Dynamic Thing

MongoDB is a schema-free document database and does not impose any restriction on what you can store in a collection. There is nothing stopping you from puttting entirely different objects into the same collection and thus nothing stopping you from omitting fields in two different objects of the same kind either. So how does this play with Javas strong static typing compared to a dynamic language like Ruby?

### Dude, Where's My ORM?

Developers used to relational databases have been using ORMs for a long time to abstract away the dirty details of dealing with the database and separating the domain from the persistence. So, are any of the three frameworks an ORM for MongoDB? Well, no. But a more interesting question is: Do I need one? MongoDB is a very different beast than oracle/mysql/MSsql/PostgreSQL and different beasts need different handling. You need _an_ abstraction model for MongoDB, not necessarily the _ORM_ abstraction model.

### MongoDB Java Driver

10Gen java driver basically gives you to options when storing data in MongoDB: Either subclass **BasicDBObject** which is the general database object, or implement the **DBObject** interface. Both approaches gives you the interface of **Map** from the standard java library and lets you put and get keys and values. The drawback is that there are a lot of methods in this interface and it will soon become tedious to implement them all for different domain objects. This it the **DBObject** interface methods:

````java
    public Object put(String s, Object o) { }

    public void putAll(DBObject dbObject) { }

    public void putAll(Map map) { }

    public Object get(String s) { }

    public Map toMap() { }

    public Object removeField(String s) { }

    public boolean containsKey(String s) { }

    public boolean containsField(String s) { }

    public Set&lt;String&gt; keySet() { }

    public void markAsPartialObject() { }

    public boolean isPartialObject() {}

```

So I'd prefer to subclass **BasicDBObject** instead or wrap it.

```javang it look like? Assume the very minimal domain objects **Person** and **Address**

```java
package no.kh.mongo.direct;
import com.mongodb.BasicDBObject;

public class Person extends BasicDBObject {

    public Person () { }

    public Person(String fullName, Address newAddress) {
        put("name", fullName);
        put("address", newAddress);

    }

}

```


```java
package no.kh.mongo.direct;
import com.mongodb.BasicDBObject;

public class Address extends BasicDBObject {

   public Address() {
  }

  public Address(String streetName, String postalCode, String place, String country) {
    put("street", streetName);
    put("postalcode", postalCode);
    put("place", place);
    put("country", country);
  }

  public String place(){
    return (String) get("place");
  }

}
```

Using this class is done like this in the form of functional/integration tests, since they touch the database but written in Junit:

```java
package no.kh.mongo.direct;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.Mongo;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.net.UnknownHostException;
import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

public class PersonPersistance {

    DB testDb;
    DBCollection persons;

    @Before
    public void setUp() throws UnknownHostException {
       Mongo m = new Mongo( "127.0.0.1" , 27017 );

       testDb = m.getDB( "test" );
       persons = testDb.getCollection("persons");
       persons.setObjectClass(Person.class);
    }

    @Test
    public void insertPersonSavesPersonToDatabase () {

        Person test = new Person("Knut Haugen",
                                 new Address("Josefines gate", "0401",
                                             "Oslo", "Norge"));
        persons.insert(test);
        assertNotNull(test.get("_id"));

    }


    @Test
    public void personWithDocumentNotMatchingObject(){
      BasicDBObject tmp = new BasicDBObject();
      tmp.append("foo", "value");
      persons.insert(tmp);

      Person test2 = (Person) persons.findOne();
      assertEquals(test2.get("foo"), "value");
      assertNull(test2.get("name"));
    }

    @Test
    public void retrievePersonFromDatabase(){
        Person test = new Person("Knut Haugen",
                                  new Address("Josefines gate", "0401",
                                              "oslo", "Norge"));
        persons.insert(test);

        Person test2 = (Person) persons.findOne();
        assertEquals(test.get("name"), test2.get("name"));
        assertEquals( ((Address) test.get("address")).place(), "oslo");
    }

    @After
    public void tearDown(){
        persons.drop();
    }

}
```

Notice the call to **setObjectClass()** on the collection object to get "type-safe" operations even though you still have to cast the return value from **findOne()** to get you precious object back. Other than that it is pretty straight forward. Call **insert()** on the collection to insert an object, **findOne()** or any other query method to retrieve it. But to the bottom line is this driver really begs for some more abstraction when you're beyond toy samples. The positive effect is more direct access to the data which is often the way it's done in dynamic languages. But does that suit Java? I'm not sure but tend to think no. And how about those nulls? Well, if one object doesn't store a value in a field, the field is null when returned from the database, as you can see from the test **personWithDocumentNotMatchingObject**.

### Morphia ###
Morphia is a (according to the blurb) a light-weight type-safe mapper for MongoDB providing DAO<T, V> and Datastore abstractions. It takes the annotation approach. Here's our **Person** and **Address** classes for Morphia:

```java
package no.kh.mongo.morphia;
import com.google.code.morphia.annotations.Embedded;
import com.google.code.morphia.annotations.Entity;
import com.google.code.morphia.annotations.Id;

@Entity
public class Person {

    @Id
    private String id;
    private String name;

    @Embedded
    private Address address;

  public Person() {
        address = new Address("", "", "", "");
    }

    public Person(Address newAddress){
        address = newAddress;
    }

    public String getId() {
        return id;
    }


    public String getName() {
        return name;
    }

    public void setId(String newId) {
        id = newId;
    }

    public void setName(String newName) {
        name = newName;
    }

    public void setAddress(Address newAddress) {
        address = newAddress;
    }

}
```


```java
package no.kh.mongo.morphia;
import com.google.code.morphia.annotations.Embedded;

@Embedded
public class Address {

  private String streetName;
  private String postalCode;
  private String place;
  private String country;

  public Address() {
  }

  public Address(String streetName, String postalCode, String place, String country) {
    this.streetName = streetName;
    this.postalCode = postalCode;
    this.place = place;
    this.country = country;
  }

}
```

Where Address is annotated as an *embedded* object. This is the same approach taken by the ruby Mongo_Mapper with its MongoMapper::Document and MongoMapper::EmbeddedDocument classes.

```java
package no.kh.mongo.morphia;

import com.google.code.morphia.Morphia;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.Mongo;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.net.UnknownHostException;
import static junit.framework.Assert.assertNotNull;
import static junit.framework.Assert.assertNull;

public class PersistanceThroughMorphia {

    Morphia morph;
    Mongo mongo;
    DBCollection persons;

    @Before
    public void setUp() throws UnknownHostException {
       morph = new Morphia();
       mongo = new Mongo("127.0.0.1", 27017);
       // This is where we map Persons and addresses
       // But shouldn't the annotation be able to handle that?
       morph.map(Person.class).map(Address.class);
       DB testDb = mongo.getDB( "test" );
       persons = testDb.getCollection("persons");
    }

    @Test
    public void storePersonThroughMorphiaMapping () {

        Person test = new Person(new Address("Josefines gate", "0401", "Oslo", "Norge") );
        test.setName("Knut Haugen");

        persons.save(morph.toDBObject(test));
        Person test2 = morph.fromDBObject(Person.class, persons.findOne());
        assertNotNull(test2.getId());

    }


    @Test
    public void personMissingField () {

        Person test = new Person(new Address("Josefines gate", "0401", "Oslo", "Norge"));

        persons.save(morph.toDBObject(test));
        Person test2 = morph.fromDBObject(Person.class, persons.findOne());
        assertNull(test2.getName());

    }


    @After
    public void tearDown(){
        persons.drop();
    }

}
```

It seems like something out of the department of redundancy department that you annotate the document and the embedded document and then have to specify the relationship between them in a method call. My first reaction was that that would have been cleaner if the relationship could be specified in the annotation too. The calls to **morph.toDBObject()** and **morph.fromDBObject()** breaks up an otherwise elegant solution. It also introduces some more code and it basically wraps up a cast. That could have been a lot cleaner.

### Mungbean ###
Mungbean is our last contestant and represents a third way of doing the mapping. It wraps up *everything* you need for accessing MongoDB with generic collection classes and introduces a DSL for querys and the like. There's also a clojure version if that is more like your poison. The domain classes with mungbean:

```java
package no.kh.mongo.mungbean;

public class Address {

  private String streetName;
  private String postalCode;
  private String place;
  private String country;

  public Address() {
  }

  public Address(String streetName, String postalCode, String place, String country) {
    this.streetName = streetName;
    this.postalCode = postalCode;
    this.place = place;
    this.country = country;
  }

  public String place(){
    return place;
  }

}
```

Nothing special here, no imports and no annotations. (Almost the) Same with Person except for the import and field of type **ObjectID** which handles the object ids generated by mongo on insert:

```java
package no.kh.mongo.mungbean;
import mungbean.ObjectId;

public class Person {
  private String name;
  private ObjectId _id = new ObjectId();
  private String address;


  public Person(String name, String address){
    this.name = name;
    this.address = address;
  }

  public String getAddress(){
    return address;
  }

  public ObjectId getId(){
    return _id;
  }
}
```

Using it on the other hand, creates a very different looking code than the other two, thanks to the wrapper classes for mongodb connections, the generic collections and the query DSL:

```java
package no.kh.mongo.mungbean;

import mungbean.DBCollection;
import mungbean.Database;
import mungbean.Mungbean;
import mungbean.Settings;
import mungbean.query.Query;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertNotNull;

public class mungbeanPersistence {

  private Database test;
  private Person testPerson;
  private DBCollection&lt;Person&gt; persons;


  @Before
  public void create() {
    test = new Mungbean(new Settings(), "localhost", 27017).openDatabase("test");
    testPerson = new Person("Knut Haugen", "josefines gate");
    persons = test.openCollection("persons", Person.class);

  }

  @Test
  public void storePerson(){
    persons.save(testPerson);
    assertEquals(persons.query(new Query().field("name").is("Knut Haugen")).size(), 1);

  }


  @Test
  public void personGetGeneratedIdAndAddress(){
    persons.save(testPerson);
    Person found = persons.query(new Query().field("name").is("Knut Haugen")).get(0);
    assertNotNull(found.getId());
    assertEquals(found.getAddress(), "josefines gate");

  }


  @After
  public void destroy() {
    test.dbAdmin().dropDatabase();
  }

}

```

The syntax is nice but perhaps a tad verbose for mye taste. I find the abstraction quite good, at least better than the other two. I also like the fact that there is almost no trace of the library in the domain classes and as such it is by far the best of the three.

### The Verdict ###

It's Mungbean, by a nose! Mainly because of the cleaner domain objects and the DSL. There is more code involved but I found it to be more elegant than the other approaches. I want to note that both morphia and mungbean are not immensely mature and *done* by any definition of the word and that has to come into consideration when using them. And it may be that a wordy statically typed language like Java has a bit of friction with a very dynamic database backend like MongoDB. I don't know, but I'll be looking into ruby drivers in the future and we'll see.

I haven't looked into the different code generation frameworks for mongo, namely [Sculptor](http://java.dzone.com/articles/using-mongodb-sculptor) and [GuicyData](http://github.com/mattinsler/com.lowereast.guiceymongo/) which take a different approach to accessing MongoDB. That's for another time and another post.
````
