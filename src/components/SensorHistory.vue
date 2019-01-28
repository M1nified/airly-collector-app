<template>
  <div class="view">
    <div class="measurements-table-box">
      <table class="measurements-table">
        <thead>
          <tr>
            <th>From</th>
            <th>Till</th>
            <th>AIRLY_CAQI</th>
            <th>PM1</th>
            <th>PM2.5</th>
            <th>PM10</th>
            <th>PRESSURE</th>
            <th>HUMIDITY</th>
            <th>TEMPERATURE</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in measurementRecords"
            :key="record.measurement.fromDateTime"
            :style="{backgroundColor:record.AIRLY_CAQI.color}"
            @click="setDetailedRecord(record)"
          >
            <td>{{record.measurement.fromDateTime}}</td>
            <td>{{record.measurement.tillDateTime}}</td>
            <td>{{record.AIRLY_CAQI.value}}</td>
            <td>{{getRecordValue(record, 'PM1')}}</td>
            <td>{{getRecordValue(record, 'PM25')}}</td>
            <td>{{getRecordValue(record, 'PM10')}}</td>
            <td>{{getRecordValue(record, 'PRESSURE')}}</td>
            <td>{{getRecordValue(record, 'HUMIDITY')}}</td>
            <td>{{getRecordValue(record, 'TEMPERATURE')}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="measurement-details">
      <div v-if="detailedRecord.installationId">
        <p>
          From: {{detailedRecord.measurement.fromDateTime}}
          <br>
          Till: {{detailedRecord.measurement.tillDateTime}}
        </p>
        <p>
          AIRLY_CAQI: {{detailedRecord.AIRLY_CAQI.value}}
          <br>
          PM1: {{getRecordValue(detailedRecord, 'PM1')}}
          <br>
          PM2.5: {{getRecordValue(detailedRecord, 'PM25')}}
          <br>
          PM10: {{getRecordValue(detailedRecord, 'PM10')}}
          <br>
          PRESSURE: {{getRecordValue(detailedRecord, 'PRESSURE')}}
          <br>
          HUMIDITY: {{getRecordValue(detailedRecord, 'HUMIDITY')}}
          <br>
          TEMPERATURE: {{getRecordValue(detailedRecord, 'TEMPERATURE')}}
          <br>
        </p>
        <p>
          {{detailedRecord.AIRLY_CAQI.description}}
          <br>
          {{detailedRecord.AIRLY_CAQI.advice}}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Store from "../Store";
export default Vue.extend({
  data() {
    return {
      id: this.$route.params.id,
      measurementRecords: {},
      detailedRecord: {}
    };
  },
  async created() {
    Store.Airly.measurements({ id: this.id }).then(measurementRecords => {
      this.measurementRecords = measurementRecords
        .map(({ measurement, ...record }) => ({
          ...record,
          measurement,
          AIRLY_CAQI: measurement.indexes.find(
            ({ name }) => name === "AIRLY_CAQI"
          )
        }))
        .sort((a, b) =>
          b.measurement.fromDateTime.localeCompare(a.measurement.fromDateTime)
        );
    });
  },
  methods: {
    setDetailedRecord(record: any) {
      this.detailedRecord = record;
      console.log(this.detailedRecord);
    },
    getRecordValue(record: any, valueName: string) {
      const { value } = record.measurement.values.find(
        ({ name, value }: { name: string; value: any }) => name === valueName
      );
      return value;
    }
  }
});
</script>
<style lang="scss" scoped>
.view {
  display: flex;
  flex-direction: column-reverse;
  //   justify-content: space-between;
  > * {
    flex-grow: 1;
  }
}
.measurements-table-box {
  overflow: auto;
}
.measurements-table {
  border-collapse: collapse;
  font-family: monospace;
  &,
  * {
    border: solid 1px rgba(0, 0, 0, 0.103);
  }
  td,
  th {
    margin: 0;
    padding: 0.3em;
    text-align: center;
  }
  tbody > tr {
    cursor: pointer;
    &:hover {
      font-weight: bold;
    }
  }
}
</style>
