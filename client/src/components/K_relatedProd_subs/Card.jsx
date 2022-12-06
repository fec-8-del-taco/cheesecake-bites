import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comparison from './Comparison.jsx';

const Card = function ({ type, currentProd, item, addToFavorites, deleteFromFavorites, setProduct }) {
  const [itemInfo, setItemInfo] = useState(null);
  const [itemStyles, setItemStyles] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // inititlizing states for info and styles based on prod id
  useEffect(() => {
    if (item) {
      axios.get(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/products/${item}`, {
          headers: { Authorization: process.env.GITHUB_TOKEN },
        })
          .then(({ data }) => setItemInfo(data))
          .catch((err) => console.log(err));

      axios.get(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/products/${item}/styles`, {
        headers: { Authorization: process.env.GITHUB_TOKEN },
      })
        .then(({ data }) => setItemStyles(data.results))
        .catch((err) => console.log(err));
    }
  }, [item]);

  // inititlizing default img url to be used later
  let defaultImg = '';
  let originalPrice = null;
  let salePrice = null;

  if (itemStyles) {
    itemStyles.forEach((style) => {
      if (style['default?']) {
        defaultImg = style.photos[0].thumbnail_url;
        originalPrice = style.original_price;
        salePrice = style.sale_price;
      }
    });
  }

  // handler for the favorite/delete button
  const buttonHandler = () => {
    if (type === 'related') {
      //addToFavorites(itemInfo.id);
      setIsModalOpen(true);
    } else {
      deleteFromFavorites(itemInfo.id);
    }
  };

  // handler for changing current product page to product user has clicked
  const changeCards = () => {
    const updateProd = (products) => {
      products.forEach((product) => {
        if (product.id === itemInfo.id) {
          setProduct(product);
          return;
        }
      })
    };

    if (itemInfo) {
      axios.get(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/products`, {
          headers: { Authorization: process.env.GITHUB_TOKEN },
        })
          .then(({ data }) => updateProd(data))
          .catch((err) => console.log(err));
    }
  };


  // TODO: can refactor saleprice later
  if (itemInfo && itemStyles) {
    return (
      <div className="card" id={type} onClick={changeCards}>

        <button className="card_button" onClick={buttonHandler}>
          {type === 'related' ?  ' ⭐ ' : ' X '}
        </button>

        {type === 'related' &&
        <Comparison itemInfo={itemInfo} currentProd={currentProd} isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}

        <img src={defaultImg} className="card_image"/>

        <p>{itemInfo.category}</p>
        <h4>{itemInfo.name}</h4>

        { !salePrice &&
          <p>${originalPrice}</p>
        }
        { salePrice &&
          <p>
            <span className="sale_price">${salePrice}</span>
            <strike>${originalPrice}</strike>
          </p>
        }

        <p>(insert stars)</p>
      </div>
    );
  }
};

export default Card;
