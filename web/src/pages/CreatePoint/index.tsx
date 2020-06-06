import React, {useEffect, useState, ChangeEvent, FormEvent} from "react";
import {Link, useHistory } from "react-router-dom";
import {FiArrowLeft} from "react-icons/fi";
import { Map, TileLayer, Marker} from "react-leaflet";
import {LeafletMouseEvent} from "leaflet";
import axios from "axios";

import api from "../../services/api";
import "./styles.css";
import logo from '../../assets/logo.svg';

interface Items {
  id: number,
  title: string,
  image_url: string;
}

interface UFIBGEResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Items[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [inicialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;

      setInicialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("items").then(response =>{
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get<UFIBGEResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);

      setUfs(ufInitials);
    });
  }, []);

  useEffect(() => {
    if(selectedUf === "0"){
      return
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const cityNames = response.data.map(city => city.nome);
      console.log()
      setCities(cityNames);
    });

  }, [selectedUf]);


  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUf(uf);
  }

  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapCLick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;

    setFormData({...formData, [name]: value});
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);

    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }

    await api.post('points', data);

    alert('Ponto de Coleta Cadastrado com Sucesso');

    history.push('/');
  }

  return (
    <div id = "page-create-point">
      <header>
        <img src = {logo} alt = "logo da aplicação"/>

        <Link to ="/">
        <FiArrowLeft />
        Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1> Cadastro do <br /> Ponto de Coleta </h1>

        <fieldset>
          <legend>
            <h2>Dados Iniciais</h2>
          </legend>

          <div className = "field">
            <label htmlFor = "name">Nome da Entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className = "field-group">
            <div className = "field">
              <label htmlFor = "email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className = "field">
              <label htmlFor = "whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2> Endereço </h2>
            <span>Selecione o endereço no mapa: </span>
          </legend>

          <Map center={inicialPosition} zoom={15} onClick={handleMapCLick}>
            <TileLayer
             attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

             <Marker position={selectedPosition}/>
          </Map>

          <div className = "field-group">
            <div className = "field">
              <label htmlFor = "uf">Estado (UF)</label>
              <select name = "uf" id = "uf" value={selectedUf} onChange = {handleSelectedUf}>
                <option value = "0"> Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key = {uf} value = {uf}> {uf} </option>
                ))}
              </select>
            </div>
            <div className = "field">
              <label htmlFor = "city">Estado (UF)</label>
              <select name = "city" id = "city" value = {selectedCity} onChange = {handleSelectedCity}>
                <option value = "0"> Selecione uma Cidade</option>
                {cities.map(city => (
                  <option key = {city} value = {city}> {city} </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>


        <fieldset>
          <legend>
            <h2> Ítens de Coleta </h2>
            <span>Selecione o endereço no mapa: </span>
          </legend>

          <ul className = "items-grid">
            {items.map(item => (
            <li
              key={item.id}
              onClick={() => handleSelectItem(item.id)}
              className={selectedItems.includes(item.id) ? "selected" : ""}
            >
              <img src={item.image_url} alt={item.title}/>
              <span>{item.title}</span>
            </li>
          ))}
          </ul>
        </fieldset>

        <button type = "submit">
          Cadastrar ponto de coleta
        </button>
      </form>

    </div>
  )
}

export default CreatePoint;
