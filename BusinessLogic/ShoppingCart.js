//=================================
// ShoppingCart - Business Logic
class ShoppingCart {
   constructor() {
       this.items = [];
   }


   //=================
   // Add a book to the cart or update quantity if already exists
   addItem(book, quantity) {
       const existingItem = this.items.find(item => item.book.id === book.id);
       if (existingItem) {
           existingItem.quantity += quantity;
       } else {
           this.items.push({ book, quantity });
       }
   }


   //=================
   // Remove a book from the cart by book ID
   removeItem(bookId) {
       this.items = this.items.filter(item => item.book.id !== bookId);
   }


   //=================
   // Get total price of all items in the cart
   getTotal() {
       return this.items.reduce((total, item) =>
           total + (item.book.pricePerCopy * item.quantity), 0);
   }
}


module.exports = ShoppingCart;

