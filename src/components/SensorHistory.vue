<template>
  <div class="view">
    <md-field>
      <label for="activecolumns">Active columns</label>
      <md-select v-model="activeColumns" name="activecolumns" id="activecolumns" md-dense multiple>
        <md-option value="From">Since</md-option>
        <md-option value="Till">Till</md-option>
        <md-option value="AIRLY_CAQI">AIRLY_CAQI</md-option>
        <md-option value="PM1">PM1</md-option>
        <md-option value="PM25">PM2.5</md-option>
        <md-option value="PM10">PM10</md-option>
        <md-option value="PRESSURE">PRESSURE</md-option>
        <md-option value="HUMIDITY">HUMIDITY</md-option>
        <md-option value="TEMPERATURE">TEMPERATURE</md-option>
        <md-option value="STANDARD_WHO_PM25">WHO PM2.5 %</md-option>
      </md-select>
    </md-field>
    <div class="measurements-table-box">
      <table class="measurements-table">
        <thead>
          <tr>
            <th v-if="activeColumn('From')">Since</th>
            <th v-if="activeColumn('Till')">Till</th>
            <th v-if="activeColumn('AIRLY_CAQI')">AIRLY_CAQI</th>
            <th v-if="activeColumn('PM1')">PM1</th>
            <th v-if="activeColumn('PM25')">PM2.5</th>
            <th v-if="activeColumn('PM10')">PM10</th>
            <th v-if="activeColumn('PRESSURE')">PRESSURE</th>
            <th v-if="activeColumn('HUMIDITY')">HUMIDITY</th>
            <th v-if="activeColumn('TEMPERATURE')">TEMPERATURE</th>
            <th v-if="activeColumn('STANDARD_WHO_PM25')">WHO PM2.5 %</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in measurementRecords"
            :key="record.measurement.fromDateTime"
            :style="{backgroundColor:record.AIRLY_CAQI.color}"
            @click="setDetailedRecord(record)"
          >
            <td v-if="activeColumn('From')">{{record.measurement.fromDateTime}}</td>
            <td v-if="activeColumn('Till')">{{record.measurement.tillDateTime}}</td>
            <td v-if="activeColumn('AIRLY_CAQI')">{{record.AIRLY_CAQI.value}}</td>
            <td v-if="activeColumn('PM1')">{{getRecordValue(record, 'PM1')}}</td>
            <td v-if="activeColumn('PM25')">{{getRecordValue(record, 'PM25')}}</td>
            <td v-if="activeColumn('PM10')">{{getRecordValue(record, 'PM10')}}</td>
            <td v-if="activeColumn('PRESSURE')">{{getRecordValue(record, 'PRESSURE')}}</td>
            <td v-if="activeColumn('HUMIDITY')">{{getRecordValue(record, 'HUMIDITY')}}</td>
            <td v-if="activeColumn('TEMPERATURE')">{{getRecordValue(record, 'TEMPERATURE')}}</td>
            <td v-if="activeColumn('STANDARD_WHO_PM25')">{{getStandard(record, 'WHO', 'PM25').percent}}</td>
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
import { EventBus } from "./../EventBus";

const COLUMNS = [
  "From",
  "Till",
  "AIRLY_CAQI",
  "PM1",
  "PM25",
  "PM10",
  "PRESSURE",
  "HUMIDITY",
  "TEMPERATURE",
  "STANDARD_WHO_PM25"
];
export default Vue.extend({
  data() {
    const activeColumns: any[] = [];
    return {
      id: this.$route.params.id,
      measurementRecords: {},
      detailedRecord: {},
      activeColumns,
      activeColumnsChangedOnce: false
    };
  },
  async created() {
    const columns =
      (await Store.Settings.setting("measurementHistoryColumns")) || [];
    this.activeColumns = COLUMNS.filter(COLUMN => {
      const column = columns.find(
        ({ column }: { column: any }) => column === COLUMN
      );
      return !column || column.active;
    });

    this.getMeasurementsData();

    EventBus.$on(`updated-${this.id}`, () => {
      this.getMeasurementsData();
    });
  },
  methods: {
    setDetailedRecord(record: any) {
      this.detailedRecord = record;
      console.log(this.detailedRecord);
    },
    getRecordValue(record: any, valueName: string) {
      const v = this.fromArrayByName(record.measurement.values, valueName);
      return v && v.value;
    },
    getStandard(record: any, standardName: string, standardPollutant: string) {
      const standard = record.measurement.standards.find(
        ({ name, pollutant }) =>
          name === standardName && pollutant === standardPollutant
      );
      return standard || {};
    },
    fromArrayByName(array: any[], name: string) {
      const element = array.find(({ name: n }) => n === name);
      return element;
    },
    async activeColumnsSave() {
      const activecolumns = COLUMNS.map(COLUMN => {
        const column = this.activeColumns.find(column => column === COLUMN);
        const item = {
          column: COLUMN,
          active: !!column
        };
        return item;
      });
      await Store.Settings.setting("measurementHistoryColumns", activecolumns);
    },
    activeColumn(column: string) {
      return this.activeColumns.some(ac => ac === column);
    },
    async getMeasurementsData() {
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
    }
  },
  watch: {
    activeColumns(event) {
      if (this.activeColumnsChangedOnce) {
        this.activeColumnsSave();
      }
      this.activeColumnsChangedOnce = true;
    }
  }
});
</script>
<style lang="scss" scoped>
.view {
  // display: flex;
  // flex-direction: column;
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
