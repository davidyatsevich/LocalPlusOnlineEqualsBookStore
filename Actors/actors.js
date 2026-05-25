class Person{
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
}

class Customer extends Person {
    constructor(id, name, email) {
        super(id, name, email);
        this.role = "customer";
    }
}

class Staff extends Person {
    constructor(id, name, email) {
        super(id, name, email);
        this.role = "staff";
    }
}