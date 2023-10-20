const schedule = require("node-schedule");
const mongoose = require("mongoose");


const MedicamentoSchema = new mongoose.Schema({
  data_Inicio: { type: String, required: true },
  duracao: { type: Number, required: true },
  duracao_Tipo: { type: String, required: true },
  frequencia: { type: Number, required: true },
  frequencia_Tipo: { type: String, required: true },
});

const MedicamentoModel = mongoose.model("Medicamento", MedicamentoSchema);

class Medicamento {
  constructor(body) {
    this.body = body;
    this.scheduleLembrete = null;
  }

  async registraBD() {
    //moldando body para se encaixar no schema
    this.body = {
      data_Inicio: this.body.dtInicio,
      data_ProxLembrete: this.body.dtInicio,
      duracao: this.body.duracao,
      duracao_Tipo: this.body.duracaoT,
      frequencia: this.body.frequencia,
      frequencia_Tipo: this.body.frequenciaT,
    };

    //inserindo BD
    await MedicamentoModel.create(this.body);
  }

  //pegando os medicamentos (MongoDB)
  static async getMedicamentos() {
    const medicamentosCollection = await MedicamentoModel.find({});
    return medicamentosCollection;
  }

  //formata data que vem com formato do firebase
  formatData(data) {
    data = data.split(" ");

    const dia = Number(data[0]);

    let mes = data[2];
    switch (mes) {
      case "janeiro":
        mes = 0;
        break;
      case "fevereiro":
        mes = 1;
        break;
      case "março":
        mes = 2;
        break;
      case "abril":
        mes = 3;
        break;
      case "maio":
        mes = 4;
        break;
      case "junho":
        mes = 5;
        break;
      case "julho":
        mes = 6;
        break;
      case "agosto":
        mes = 7;
        break;
      case "setembro":
        mes = 8;
        break;
      case "outubro":
        mes = 9;
        break;
      case "novembro":
        mes = 10;
        break;
      case "dezembro":
        mes = 11;
        break;
    }

    const ano = Number(data[4]);
    const horario = data[6].split(":");
    const hora = Number(horario[0]);
    const minuto = Number(horario[1]);
    const segundo = Number(horario[2]);

    return new Date(ano, mes, dia, hora, minuto, segundo);
  }

  //agenda medicamento com os dados do banco
  agendaMedicamento(
    lembreteId,
    dtInicio,
    duracao,
    duracaoT,
    frequencia,
    frequenciaT
  ) {
    //formatando data firebase para o objeto Date
    const dataInicio = this.formatData(dtInicio);
    const dataFinal = this.duracaoMaxima(dataInicio, duracao, duracaoT);

    //rotina lembrete
    this.criaLembrete(dataInicio, frequencia, frequenciaT, dataFinal);
  }

  //cria lembrete recursivo, que se rechama enquanto a data atual for menor que a data final
  criaLembrete(data, frequencia, frequenciaT, dataFinal) {
    const scheduleLembrete = schedule.scheduleJob(data, (dataAtual) => {
      console.log("Testando");

      if (dataAtual < dataFinal) {
        data = this.duracaoMaxima(data, frequencia, frequenciaT);
        this.criaLembrete(data, frequencia, frequenciaT, dataFinal);
        return;
      }
      console.log("fim");
      scheduleLembrete.cancel();
    });
  }

  //incrementa tempo há uma data
  duracaoMaxima(dataInicio, duracao, duracaoTipo) {
    
    Date.prototype.addHoras = function (horas) {
      this.setHours(this.getHours() + horas);
    };
    Date.prototype.addMinutos = function (minutos) {
      this.setMinutes(this.getMinutes() + minutos);
    };
    Date.prototype.addSegundos = function (segundos) {
      this.setSeconds(this.getSeconds() + segundos);
    };
    Date.prototype.addDias = function (dias) {
      this.setDate(this.getDate() + dias);
    };
    Date.prototype.addMeses = function (meses) {
      this.setMonth(this.getMonth() + meses);
    };
    Date.prototype.addAnos = function (anos) {
      this.setYear(this.getFullYear() + anos);
    };

    //copiando data inicio para modifica-lá
    let dataFinal = new Date(dataInicio);

    //garantindo que duracao é number e tipo é string
    duracao = Number(duracao);
    duracaoTipo = duracaoTipo + "";

    //adiciona duracao baseada no tipo
    switch (duracaoTipo) {
      case "segundo(s)":
        dataFinal.addSegundos(duracao);
        return dataFinal;
        break;
      case "minuto(s)":
        dataFinal.addMinutos(duracao);
        return dataFinal;
        break;
      case "hora(s)":
        dataFinal.addHoras(duracao);
        return dataFinal;
        break;
      case "dia(s)":
        dataFinal.addDias(duracao);
        return dataFinal;
        break;
      case "semana(s)":
        const semanasEmDias = duracao * 7;
        dataFinal.addDias(semanasEmDias);
        console.log(semanasEmDias);
        return dataFinal;
      case "mes(es)":
        dataFinal.addMeses(duracao);
        return dataFinal;
    }
  }
}

module.exports = Medicamento;
