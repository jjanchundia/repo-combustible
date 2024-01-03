import { Component, OnInit } from '@angular/core';
import { AuthConfigService } from '../auth-config.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {
  userName: string | undefined;
  petitioners: [] = [];
  solicitante: { id: number; name: string }[] = [];
  minDate: any;
  maxDate: any;
  ventana_entrega: {codigo: string, name: string} [] = [];
  planta: { plantId: string, name: string} [] = [];
  volumen: { volume: string, volumesDistribution: string} [] = [];
  endpoint: string = 'https://tceqgc0m29.execute-api.us-west-2.amazonaws.com/';
  volumenData: [] = [];
  validaSelecTipoCamion: boolean = false;
  //Para controlar los valores de los input--> Check
  checkboxValuesGasolina93: string[] = [];
  checkboxValuesGasolina97: string[] = [];
  checkboxValuesDiesel: string[] = [];
  checkboxValuesKerosene: string[] = [];
  sumaCheckGasolina93: Number = 0;
  sumaCheckGasolina97: Number = 0;
  sumaCheckDiesel: Number = 0;
  sumaCheckKerosene: Number = 0;

  constructor(public authConfigService: AuthConfigService, private httpClient: HttpClient) { }
  ngOnInit() {

    this.fetchPetitioners();

    // const dataPipe = new DatePipe('en-Us');
    this.minDate = new Date().toISOString().split('T')[0];//dataPipe.transform(new Date(), 'yyyy-MM-dd');
    // Establecer la fecha máxima como un día más que la fecha actual
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.maxDate = tomorrow.toISOString().split('T')[0];

    if (this.authConfigService.oauthService.hasValidAccessToken()) {
      console.log('Token de acceso válido. Obteniendo el nombre del usuario...');
      this.getUserName();
      this.loadUserProfile();
    }
    else{
      console.log('no')
    }



    // Ahora puedes usar jQuery aquí
    $(document).ready(function() {
      $('#datepicker').datepicker({
        uiLibrary: 'bootstrap5'
    });

    $('#datepicker-2').datepicker({
        uiLibrary: 'bootstrap5'
    });

    $('#datepicker-3').datepicker({
        uiLibrary: 'bootstrap5'
    });
    });

  }

  fetchPetitioners(): void {
    const endpoint = `${this.endpoint}user/search?email=mduran@lisit.cl`;//'https://tceqgc0m29.execute-api.us-west-2.amazonaws.com/user/search?email=mduran@lisit.cl';

    this.httpClient.get(endpoint)
      .subscribe((response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          const firstUserData = response.data[0];
          this.petitioners = firstUserData.petitioners;
          this.procesarPetitioners();
        }
      });
  }

  selectDate(event: any): void {
    // Obtenemos fecha desde el cliente
    const selectedDate = new Date(event.target.value);

    // Fecha actual
    const currentDate = new Date();

    //Calculo de horas/minutos actuales
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();

    // Obtenemos valores a mostrar según rango horario
    this.ventana_entrega = this.obtenerRangoHorario(currentTime, selectedDate, currentDate);
  }

  obtenerRangoHorario(currentTime: number, selectedDate: Date, currentDate: Date): any[] {
      const rangoHorario = [
          { inicio: 0, fin: 1439, name: '004 00:00-23:59 Cualquier', codigo:'004' },
          { inicio: 0, fin: 480, name: '006 00:00-08:00 Madrugada', codigo:'006' },
          { inicio: 480, fin: 840, name: '001 08:00-14:00 AM', codigo:'001' },
          { inicio: 480, fin: 1080, name: '005 08:00-18:00 Habil', codigo:'005' },
          { inicio: 840, fin: 1200, name: '002 14:00-20:00 PM', codigo:'002' },
          { inicio: 1200, fin: 1439, name: '003 20:00-23:59 Noche', codigo:'003' },
      ];

      // Convertimos fecha para validación entre ambas
      const selectedDateISOString = selectedDate.toISOString().split('T')[0];
      const currentDateISOString = currentDate.toISOString().split('T')[0];

      // Verificar si es la misma fecha
      const esMismaFecha = selectedDateISOString === currentDateISOString;

      // Filtrar los rangos horarios basándote en la hora actual
      const rangosFiltrados = rangoHorario.filter(rango => {
          return (currentTime >= rango.inicio && currentTime <= rango.fin);
      });

      // Retornar los resultados dependiendo de la fecha y los rangos filtrados
      if (esMismaFecha) {
          return rangosFiltrados;
      } else {
          return rangoHorario;
      }
  }

  procesarPetitioners(): void {
    const endpoint = 'https://tceqgc0m29.execute-api.us-west-2.amazonaws.com/petitioner?petitioner_id=';

    let objIds = this.petitioners;
    const observables = [];

    for (const key in objIds) {
      observables.push(this.httpClient.get(`${endpoint}${objIds[key]}`));
    }

    forkJoin(observables).subscribe((responses: any[]) => {
      responses.forEach((response, index) => {
        if (response.success && response.data) {
          this.solicitante.push({
            id: Number(objIds[index]),
            name: response.data.petitionerName
          });
        }
      });

      // Ordenar el array después de recibir todas las respuestas
      this.solicitante.sort((a, b) => a.id - b.id);

      // console.log("solicitante ordenado", this.solicitante);
    });
  }

  // Evento onChange de select de planta
  onChangeSolicitante(event: any): void{
    console.log(event.target.value);
    this.fetchPetitioner(event.target.value);

    this.volumen = [];
    this.validaSelecTipoCamion = false;
    this.resetValoresCheck();

  }

  resetValoresCheck(): void{
    this.sumaCheckGasolina93 = 0;
    this.sumaCheckGasolina97 = 0;
    this.sumaCheckDiesel = 0;
    this.sumaCheckKerosene = 0;
    this.checkboxValuesGasolina93= [];
    this.checkboxValuesGasolina97 = [];
    this.checkboxValuesDiesel = [];
    this.checkboxValuesKerosene = [];
  }

  handlePlantsIds(plantsIds: any[]): void {
    // Array para almacenar observables de las solicitudes HTTP
    const plantObservables = plantsIds.map((plantId: string) => {
      const endpoint = `${this.endpoint}plant?plant_id=${plantId}`;
      return this.httpClient.get(endpoint);
    });

    // Combinar múltiples observables en uno solo
    forkJoin(plantObservables).subscribe((responses: any[]) => {
      // Manipulamos las respuestas aquí y llenamos el array planta
      this.planta = responses.map(response => {
        return {
          plantId: response.data.plantId,
          name: response.data.name
        };
      });

      // console.log(this.planta);

    });
  }

  fetchPetitioner(value: Number): void {
    let endpoint = `${this.endpoint}petitioner?petitioner_id=${value}`;// `https://tceqgc0m29.execute-api.us-west-2.amazonaws.com/petitioner?petitioner_id=${value}`;
    // console.log(endpoint);

    let plantsIds:any[]=[];

    this.httpClient.get(endpoint)
      .subscribe((response: any) => {
        if (response.success && response.data) {
          // console.log(response.data);
          // Utilizar un Set para almacenar ids de materials de forma única
          const uniquePlantIdsSet = new Set(response.data.materials.map((material: { plantId: string }) => material.plantId));

          // Convertir el Set a un array para asignarlo a plantsIds
          plantsIds = Array.from(uniquePlantIdsSet);
          this.handlePlantsIds(plantsIds);
        }
      });
  }

   // Evento onChange de select de planta
  onChangePlanta(event: any): void{
    let plantId = event.target.value;
    // this.fetchPetitioner(event.target.value);
    const endpoint = `${this.endpoint}plant?plant_id=${plantId}`;

    this.httpClient.get(endpoint)
      .subscribe((response: any) => {
        if (response.success && response.data) {
          // console.log(response.data);
          this.volumen = response.data.volumes.map((i: { volume: string, volumesDistribution: string }) => {
            return {
              volume: i.volume,
              volumesDistribution: i.volumesDistribution
            };
          });
        }
      });

      if(plantId === "0"){
        this.volumen = [];
        this.validaSelecTipoCamion = false;
        this.resetValoresCheck();
      }
  }

  onChangeCamion(event: any): void{
    let volumen = event.target.value;
    volumen = volumen.split("|");

    this.volumenData = volumen;

    if (event.target.value === "0") {
      this.resetValoresCheck();
      this.validaSelecTipoCamion = false;
    }else{
      this.resetValoresCheck();
      this.validaSelecTipoCamion = true;
    }
  }

  onCheckboxChange(event: any, value: string): void {
    if (event.target.checked) {
      this.checkboxValuesGasolina93.push(value);
    } else {
      // Esto es para eliminar el valor cuando el checkbox se desmarca
      const index = this.checkboxValuesGasolina93.indexOf(value);
      if (index !== -1) {
        this.checkboxValuesGasolina93.splice(index, 1);
      }
    }

    let suma = this.checkboxValuesGasolina93.reduce((total, valor) => total + parseFloat(valor), 0);
    this.sumaCheckGasolina93 = suma;
  }

  onCheckboxChange2(event: any, value: string): void {
    if (event.target.checked) {
      this.checkboxValuesGasolina97.push(value);
    } else {
      // Esto es para eliminar el valor cuando el checkbox se desmarca
      const index = this.checkboxValuesGasolina97.indexOf(value);
      if (index !== -1) {
        this.checkboxValuesGasolina97.splice(index, 1);
      }
    }

    let suma = this.checkboxValuesGasolina97.reduce((total, valor) => total + parseFloat(valor), 0);
    this.sumaCheckGasolina97 = suma;
  }

  onCheckboxChange3(event: any, value: string): void {
    if (event.target.checked) {
      this.checkboxValuesDiesel.push(value);
    } else {
      // Esto es para eliminar el valor cuando el checkbox se desmarca
      const index = this.checkboxValuesDiesel.indexOf(value);
      if (index !== -1) {
        this.checkboxValuesDiesel.splice(index, 1);
      }
    }

    let suma = this.checkboxValuesDiesel.reduce((total, valor) => total + parseFloat(valor), 0);
    this.sumaCheckDiesel = suma;
  }

  onCheckboxChange4(event: any, value: string): void {
    if (event.target.checked) {
      this.checkboxValuesKerosene.push(value);
    } else {
      // Esto es para eliminar el valor cuando el checkbox se desmarca
      const index = this.checkboxValuesKerosene.indexOf(value);
      if (index !== -1) {
        this.checkboxValuesKerosene.splice(index, 1);
      }
    }

    let suma = this.checkboxValuesKerosene.reduce((total, valor) => total + parseFloat(valor), 0);
    this.sumaCheckKerosene = suma;
  }

  getUserName() {
    const claims = this.authConfigService.getProfile();
   /* console.log('Claims del usuario:', claims);
    const fullName = claims ? (claims as any).name : undefined;
const givenName = claims ? (claims as any).given_name : undefined;
const familyName = claims ? (claims as any).family_name : undefined;*/

  }
  async loadUserProfile() {
    try {
      //const userProfile = await this.authConfigService.oauthService.loadUserProfile();
      //console.log('Perfil del usuario cargado:', userProfile);
    } catch (error) {
     // console.error('Error al cargar el perfil del usuario:', error);
    }
  }
}
