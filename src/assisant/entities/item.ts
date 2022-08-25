import Entity from "./entity";

export default class Item extends Entity {
    __type = "Item";
    amount: number;
}
