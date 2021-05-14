import { useEffect, useState } from "react";
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { OrderList } from 'primereact/orderlist';
import Parse from './lib/ParseConfig';

import './App.css';

const distanceSelectItems = [
  { label: 'Até 50 metros', value: 0.05 },
  { label: 'Até 100 metros', value: 0.1 },
  { label: 'Até 500 metros', value: 0.5 },
  { label: 'Até 1 km', value: 1 },
  { label: 'Até 5 km', value: 5 },
  { label: 'Até 10 km', value: 10 },
];

const App = () => {
  const [coords, setCoords] = useState(null);
  const [places, setPlaces] = useState(null);
  const [searchWord, setSearchWord] = useState('');
  const [distance, setDistance] = useState(0.05);

  useEffect(() => {
    function init() {
      navigator.geolocation.getCurrentPosition(async position => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        const point = new Parse.GeoPoint({ latitude, longitude });
        const sorted = true;

        const query = new Parse.Query('Store');
        query.withinKilometers('coords', point, distance, sorted);
        query.limit(10);
        const result = await query.find();

        const placesFound = result.map(r => {
          const distanceTo = r.get('coords').kilometersTo(point);
          const val = r.toJSON();
          val.distanceTo = formatValue(distanceTo);
          return val;
        });
        setPlaces(placesFound);
      });
    }

    init();
  }, [distance]);

  const formatValue = value => `${(value * 1000).toFixed()} metros`;

  return (
    <div className="p-fluid p-grid">
      {coords && places && (
        <Card className="p-col-12">
          <div className="p-d-flex p-flex-column">
            <div className="p-col">
              <h3 className="p-mt-0 p-mb-0">Preço de medicamentos</h3>
            </div>

            <div className="p-col-12">
              <label htmlFor="dropdown-list">Farmácias perto</label>
              <Dropdown id="dropdown-list" className="p-col-12 p-dropdown-list" value={distance} options={distanceSelectItems} onChange={(e) => setDistance(e.value)} placeholder="Selecione" />
            </div>

            <div className="p-col-12">
              <InputText
                id="firstname2"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Nome do medicamento..." />
            </div>

            <div className="p-col-12">
              <Button icon="pi pi-search" label="Buscar" className="p-button-success" />
            </div>

            <Card>
              {places.map(p => (
                <div className="card-content" key={p.objectId}>
                  <p>
                    <a target="__blank" href={p.link}>{p.alias}</a>
                  </p>
                  <p>{p.distanceTo}</p>
                  <p>Tel: <a href={`tel:${p.phone}`}>{p.phone}</a></p>
                  <Divider />
                </div>
              ))}
            </Card>

          </div>
        </Card>
      )}
    </div>
  )
}

export default App;