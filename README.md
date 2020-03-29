# marriage-rummy
An app for playing an offline version of marriage-rummy


Session-specific variables:
1. x number of players where x <= 10
2. number of decks (default: 3, limit: 5)
3. value of honor/power (default = 4 points)
4. special honor-combination/marriage (default: joker - 1, joker, joker + 1; (joker -1) * 3; (joker + 1) * 3 )
5. special honor-combination points: (default: 20)
6. number of cards/hand (default: 21) 
7. direction of play (clockwise/anti-clockwise)

round-specific variable:
-

game-specific variables:
1. is player active/inactive in a certain game

Game rules:

meta:
* game < round <= session
* round: when all players have dealt once 
* game: even deal constitutes a game
* session: number of rounds; occasionally there can be a part round (eg 1 session = 2.4 rounds)

Defined card pattern terms:
* sequence: consists of 3-5 cards which follow a certain pattern
* pure sequence: a sequence differing by 0 or 1 of the same suit
* impure sequence: a sequence which is not pure and aided by 0 or more joker's; (differs by 1 of the same suit) or (differs by 0, but all of different suit’s )


Gameplay:
1. The person next to the dealer (against the direction of play) cuts the deck before the dealer can start dealing
2. when all cards are dealt by the dealer, the dealer opens a card and places it face-up on the 'play-pile'; this has to be picked by the person next to the dealer (dictated by direction of play)
3. The person next to the dealer (against the direction of play) picks the ‘joker’ from the deck
4. in every move, a player has to pick a card into his hand; and throw a card from his hand. This constitutes a move
    -> picking a card: can be picked from the last face-up open card on the ‘play-pile’ OR from the closed deck
         A card should be picked such that it aids in formation of sequence in the hand of the player (preference to be given to making a pure sequence first). Joker & honor     
         cards have special privileges, so they can be picked up even if they don’t aid in sequence formation
    -> throwing a card: Discard a card from the pile which does not form a sequence or a potential sequence from the hand. As the person next to you would get a choice to pick a card, discard strategically such that the card doesn’t add value to the next person. Also, it is preferable to discard card’s with bigger face values (eg. A, K, Q, J, 10), as they reduce the overall points in the hand of the person in case that person loses

Card Points(needed at the end of the game):
• Js, Qs, Ks and A’s of all the suits carry 10 points each.
• All the numbered cards carry points equal to their face value. For example, 4 of Spades carries 4 points and 9 of Clubs carries 9 points.
• All Jokers carry zero points each.



finishing a game: 
1. When a person has at least 3 pure sequences; and is able to compose defined card patterns from the rest of his hand, except for one card, he/she can choose to ‘declare’ to be the winner in the game by choosing to keep that unfitting card face-down on the play area
2. When a person has declared a win, points are calculated in a zero-sum fashion as defined below:
    []powers/honors and special honor/power combination(called marriage): each person shows how many honors/powers they possess
    []hx
