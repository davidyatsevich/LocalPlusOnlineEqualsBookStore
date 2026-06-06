class ShoppingCart {
   constructor() {
       this.items = [];
   }


   // increments quantity if the book is already in the cart
   addItem(book, quantity) {
       const existingItem = this.items.find(item => item.book.id === book.id);
       if (existingItem) {
           existingItem.quantity += quantity;
       } else {
           this.items.push({ book, quantity });
       }
   }


   removeItem(bookId) {
       this.items = this.items.filter(item => item.book.id !== bookId);
   }


   getTotal() {
       // books use `price`, not `pricePerCopy`
       return this.items.reduce((total, item) =>
           total + (item.book.price * item.quantity), 0);
   }
}


module.exports = ShoppingCart;
