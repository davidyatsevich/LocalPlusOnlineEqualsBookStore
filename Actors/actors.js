//======================
// Person abstract base class
class Person{
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
}

//======================
// Customer subclass
class Customer extends Person {
    constructor(id, name, email, password) {
        super(id, name, email, password);
        this.role = "customer";
    }
}

//======================
// Staff subclass
class Staff extends Person {
    constructor(id, name, email, password) {
        super(id, name, email, password);
        this.role = "staff";
    }
}