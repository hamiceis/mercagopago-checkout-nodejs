import dayjs from "dayjs";

//Funções de formatação de DATA/Valor monetário e número

export const formatters = {
  timestamp(date?: Date): string {
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
  },

  currency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  //Formata número com separadores de milhar
  number(value: number): string {
    return new Intl.NumberFormat("pt-BR").format(value);
  },
};
