class Book {
    constructor(id, title, author, price, stock){
        this.id = id;
        this.author = author;
        this.title = title;
        this.price = price;
        this.stock = stock;
    }

    reduceStock(copies){
        if (copies <= 0) {
            throw new Error("Quantity must be greater than 0")
        }
        if (copies > this.stock){
            throw new Error("Not enouigh stock available.")
        }

        this.stock -= copies;

    }


    increaseStock(copies){
        if(copies <= 0) {
            throw new Error("Quantity must be greater than 0.")
        }
        this.stock+= copies;
    }


    isInStock(copies){
        return this.stock >= copies;
    }


    getTotalPrice(copies){
        if(copies <= 0){
            throw new Error("Quantity must be greater than 0")
        }
        return this.price * copies;
    }
}

module.exports = Book;