import React, { useReducer, useContext } from 'react'

// Initialize the context
const CartContext = React.createContext()

// Definte the default state
const initialState = {
  itemsById: {},
  allItems: [],
}

// Define reducer actions
const ADD_ITEM = 'ADD_ITEM'
const REMOVE_ITEM = 'REMOVE_ITEM'
const UPDATE_ITEM_QUANTITY = 'UPDATE_ITEM_QUANTITY'

// Define the reducer
const cartReducer = (state, action) => {
  const { payload } = action;
  switch (action.type) {
    case ADD_ITEM:
      return {
        ...state,
        itemsById: {
          ...state.itemsById,
          [payload._id]: {
            ...payload,
            quantity: state.itemsById[payload._id]
              ? state.itemsById[payload._id].quantity + 1
              : 1,
          },
        },
        // Use `Set` to remove all duplicates
        allItems: Array.from(new Set([...state.allItems,payload._id])),
      };
      
    case REMOVE_ITEM:
      return {
        ...state,
        itemsById: Object.entries(state.itemsById)
          .filter(([key, value]) => key !== action.payload._id)
          .filter(([key]) => key !== payload._id)
          .reduce((obj, [key, value]) => {
            obj[key] = value
            return obj
            obj[key] = value;
            return obj;
          }, {}),
          allItems: state.allItems.filter((itemId) => itemId !== payload._id),
        };
  
      case UPDATE_ITEM_QUANTITY:
        const currentItem = state.itemsById[payload._id];
        if (!currentItem) {
          return state; // If the item doesn't exist, return the current state
        }
  
        const newQuantity = currentItem.quantity + payload.quantity;
        if (newQuantity <= 0) {
          // If quantity becomes 0 or less, remove the item
          const { [payload._id]: _, ...restItems } = state.itemsById;
          return {
            ...state,
            itemsById: restItems,
            allItems: state.allItems.filter((itemId) => itemId !== payload._id),
          };
        }

        return {
          ...state,
          itemsById: {
            ...state.itemsById,
            [payload._id]: {
              ...currentItem,
              quantity: newQuantity,
            },
          },
        };
      
    
    default:
      return state
  }
};

// Define the provider
const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Remove an item from the cart
  const removeFromCart = (product) => {
    dispatch({ type: REMOVE_ITEM, payload: product });
  };

  // Add an item to the cart
  const addToCart = (product) => {
    dispatch({ type: ADD_ITEM, payload: product });
  };

  // todo Update the quantity of an item in the cart
  const updateItemQuantity = (productId, quantity) => {
    dispatch({ type: UPDATE_ITEM_QUANTITY, payload: { _id: productId, quantity } });
  };


  // todo Get the total price of all items in the cart
  const getCartTotal = () => {
    return getCartItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getCartItems = () => {
    return state.allItems.map((itemId) => state.itemsById[itemId]) ?? [];
  }

  return (
    <CartContext.Provider
      value={{
        cartItems: getCartItems(),
        addToCart,
        updateItemQuantity,
        removeFromCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

const useCart = () => useContext(CartContext)

export { CartProvider, CartContext }