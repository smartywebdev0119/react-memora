import { useState, useEffect } from 'react';

import { wait, shuffle } from '~/utils/helpers';
import { names } from '~/shapes';

export default function useLogic() {
  const [cards, setCards] = useState(names.concat(names));
  const [flipped, setFlipped] = useState(Array(cards.length).fill(false));
  const [selectedPair, setSelectedPair] = useState([]);
  const [processing, setProcessing] = useState(false);

  // Initial shuffle
  useEffect(() => shuffleCards(), []);

  useEffect(async () => {
    if (processing || selectedPair.length < 2) {
      return;
    }

    // Prevent clicks
    setProcessing(true);

    // Wait a bit to allow animations to finish
    await wait(500);

    // If the selected pair is not a match,
    // flip the selected cards face down
    if (!isMatch(...selectedPair)) {
      await unflipPair(...selectedPair);
      setProcessing(false);
      return;
    }

    // If all cards have been matched,
    // all cards are flipped facing down
    // and then cards are shuffled
    if (isExhausted()) {
      await unflipAll();
      shuffleCards();
      setProcessing(false);
      return;
    }

    // Reaching this point means
    // the selected pair is a match
    // but not all cards have been exhausted
    setSelectedPair([]);
    setProcessing(false);
  }, [flipped]);

  const shuffleCards = () => setCards(shuffle(cards.slice()));
  const isExhausted = () => !flipped.includes(false);
  const isMatch = (a, b) => cards[a] === cards[b];
  const unflipPair = async (a, b) => {
    const copy = flipped.slice();
    copy[a] = false;
    copy[b] = false;
    setFlipped(copy);
    await wait(400);
    setSelectedPair([]);
    await wait(400);
  };
  const unflipAll = async () => {
    // A bit of a hack to animate all cards raising off the table
    setSelectedPair(Array.from(cards.keys()));
    await wait(400);
    setFlipped(Array(flipped.length).fill(false));
    await wait(400);
    setSelectedPair([]);
    await wait(400);
  };

  const flipCard = index => {
    if (processing || selectedPair.length >= 2 || flipped[index]) {
      return;
    }

    const flippedCopy = flipped.slice();
    flippedCopy[index] = true;

    const pairCopy = selectedPair.slice();
    pairCopy.push(index);

    setFlipped(flippedCopy);
    setSelectedPair(pairCopy);
  };

  return {
    cards,
    flipped,
    selectedPair,
    flipCard,
  };
}