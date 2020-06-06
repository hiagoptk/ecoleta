import express from 'express';
import PointsControler from "./controlers/PointsControler";
import ItemsControler from "./controlers/ItemsControler";

const routes = express.Router();
const pointsControler = new PointsControler();
const itemsControler = new ItemsControler();

routes.get('/items', itemsControler.index);

routes.post('/points', pointsControler.create);
routes.get('/points', pointsControler.index);
routes.get('/points/:id', pointsControler.show);

export default routes;
