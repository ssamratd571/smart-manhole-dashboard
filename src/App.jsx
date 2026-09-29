import React, { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Droplets,
  Gauge,
  History,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  Wind
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { db } from "./firebase";

const MANHOLE_ID = "Manhole_01";

// Demo values shown if Firebase has no data
const DEMO_DATA = {
  temperature: 31.6,
  humidity: 72.6,
  water_level_cm: 8.16,
  water_status: "CRITICAL",
  gas_raw: 132,
  gas_status: "NORMAL",
  timestamp: "2026-09-29 10:00:23"
};


// ======================================================
// Convert Firebase history object into array
// ======================================================

function normalizeHistory(data) {
  if (!data) {
    return [];
  }

  return Object.keys(data)
    .map(function (key) {
      const item = data[key];

      return {
        id: key,
        temperature: Number(item.temperature || 0),
        humidity: Number(item.humidity || 0),
        water_level_cm: Number(item.water_level_cm || 0),
        water_status: item.water_status || "NORMAL",
        gas_raw: Number(item.gas_raw || 0),
        gas_status: item.gas_status || "NORMAL",
        timestamp: item.timestamp || key
      };
    })
    .sort(function (a, b) {
      return String(a.timestamp).localeCompare(
        String(b.timestamp)
      );
    });
}


// ======================================================
// Format time
// ======================================================

function formatTime(value) {
  if (!value) {
    return "--";
  }

  return String(value);
}


// ======================================================
// Status badge
// ======================================================

function StatusBadge({ status }) {
  const currentStatus = String(
    status || "UNKNOWN"
  ).toUpperCase();

  let className = "status unknown";

  if (currentStatus === "NORMAL") {
    className = "status normal";
  }

  if (currentStatus === "MEDIUM") {
    className = "status medium";
  }

  if (currentStatus === "HIGH") {
    className = "status high";
  }

  if (currentStatus === "CRITICAL") {
    className = "status critical";
  }

  return (
    <span className={className}>
      {currentStatus}
    </span>
  );
}


// ======================================================
// Sensor card
// ======================================================

function SensorCard({
  icon,
  title,
  value,
  unit,
  description,
  status
}) {
  const Icon = icon;

  return (
    <div className="sensor-card">

      <div className="sensor-card-top">

        <div className="sensor-icon">
          <Icon size={24} />
        </div>

        {status && (
          <StatusBadge status={status} />
        )}

      </div>

      <div className="sensor-title">
        {title}
      </div>

      <div className="sensor-value">
        {value}
        {unit && (
          <span>{unit}</span>
        )}
      </div>

      <div className="sensor-description">
        {description}
      </div>

    </div>
  );
}


// ======================================================
// Chart section
// ======================================================

function ChartSection({
  title,
  icon,
  children
}) {
  const Icon = icon;

  return (
    <div className="chart-card">

      <div className="chart-header">

        <div className="chart-title">

          <Icon size={20} />

          <span>
            {title}
          </span>

        </div>

      </div>

      {children}

    </div>
  );
}


// ======================================================
// MAIN APP
// ======================================================

function App() {

  const [current, setCurrent] =
    useState(DEMO_DATA);

  const [history, setHistory] =
    useState([]);

  const [firebaseConnected, setFirebaseConnected] =
    useState(false);

  const [firebaseError, setFirebaseError] =
    useState("");


// ======================================================
// FIREBASE
// ======================================================

  useEffect(function () {

    // IMPORTANT:
    // No template strings are used here.

    const currentPath =
      "SmartManhole/" +
      MANHOLE_ID +
      "/current";

    const historyPath =
      "SmartManhole/" +
      MANHOLE_ID +
      "/history";


    const currentReference =
      ref(db, currentPath);

    const historyReference =
      ref(db, historyPath);


    // --------------------------------------------------
    // CURRENT DATA
    // --------------------------------------------------

    const unsubscribeCurrent =
      onValue(
        currentReference,

        function (snapshot) {

          const data =
            snapshot.val();

          console.log(
            "Firebase current data:",
            data
          );

          if (data) {

            setCurrent({
              temperature:
                Number(
                  data.temperature || 0
                ),

              humidity:
                Number(
                  data.humidity || 0
                ),

              water_level_cm:
                Number(
                  data.water_level_cm || 0
                ),

              water_status:
                data.water_status ||
                "NORMAL",

              gas_raw:
                Number(
                  data.gas_raw || 0
                ),

              gas_status:
                data.gas_status ||
                "NORMAL",

              timestamp:
                data.timestamp ||
                "--"
            });
          }

          setFirebaseConnected(true);
          setFirebaseError("");
        },

        function (error) {

          console.error(
            "Firebase current error:",
            error
          );

          setFirebaseConnected(false);

          setFirebaseError(
            error.message ||
            "Firebase connection failed"
          );
        }
      );


    // --------------------------------------------------
    // HISTORY DATA
    // --------------------------------------------------

    const unsubscribeHistory =
      onValue(
        historyReference,

        function (snapshot) {

          const data =
            snapshot.val();

          console.log(
            "Firebase history data:",
            data
          );

          const historyArray =
            normalizeHistory(data);

          setHistory(historyArray);

          setFirebaseConnected(true);
        },

        function (error) {

          console.error(
            "Firebase history error:",
            error
          );

          setFirebaseConnected(false);

          setFirebaseError(
            error.message ||
            "Firebase history failed"
          );
        }
      );


    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return function () {

      unsubscribeCurrent();

      unsubscribeHistory();

    };

  }, []);


// ======================================================
// CHART DATA
// ======================================================

  const chartData =
    useMemo(
      function () {

        return history
          .slice(-50)
          .map(function (item) {

            return {
              time: item.timestamp,

              temperature:
                item.temperature,

              humidity:
                item.humidity,

              water:
                item.water_level_cm,

              gas:
                item.gas_raw
            };

          });

      },
      [history]
    );


// ======================================================
// CURRENT STATUS
// ======================================================

  const waterStatus =
    String(
      current.water_status ||
      "NORMAL"
    ).toUpperCase();

  const gasStatus =
    String(
      current.gas_status ||
      "NORMAL"
    ).toUpperCase();


// ======================================================
// RENDER
// ======================================================

  return (

    <div className="app">

      {/* ================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            <Activity size={26} />
          </div>

          <div>

            <h1>
              Smart Manhole
            </h1>

            <p>
              IoT Monitoring Dashboard
            </p>

          </div>

        </div>


        <div className="header-right">

          <div
            className={
              firebaseConnected
                ? "connection online"
                : "connection offline"
            }
          >

            <span className="connection-dot"></span>

            {firebaseConnected
              ? "Firebase Connected"
              : "Firebase Offline"}

          </div>


          <div className="manhole-id">

            <ShieldCheck size={18} />

            {MANHOLE_ID}

          </div>

        </div>

      </header>


      {/* ================================================
          MAIN
      ================================================= */}

      <main className="container">


        {/* Firebase Error */}

        {firebaseError && (

          <div className="alert-box">

            <AlertTriangle size={20} />

            <span>
              Firebase:
              {" "}
              {firebaseError}
            </span>

          </div>

        )}


        {/* ================================================
            TITLE
        ================================================= */}

        <section className="hero">

          <div>

            <div className="hero-label">
              LIVE MONITORING
            </div>

            <h2>
              Smart Manhole Sensor Data
            </h2>

            <p>
              Real-time monitoring of temperature,
              humidity, water level and gas.
            </p>

          </div>


          <div className="last-update">

            <Clock3 size={20} />

            <div>

              <span>
                Last Update
              </span>

              <strong>
                {formatTime(
                  current.timestamp
                )}
              </strong>

            </div>

          </div>

        </section>


        {/* ================================================
            SENSOR CARDS
        ================================================= */}

        <section className="sensor-grid">


          <SensorCard
            icon={Thermometer}
            title="Temperature"
            value={Number(
              current.temperature || 0
            ).toFixed(1)}
            unit="°C"
            description="DHT11 sensor"
          />


          <SensorCard
            icon={Droplets}
            title="Humidity"
            value={Number(
              current.humidity || 0
            ).toFixed(1)}
            unit="%"
            description="DHT11 relative humidity"
          />


          <SensorCard
            icon={Gauge}
            title="Water Distance"
            value={Number(
              current.water_level_cm || 0
            ).toFixed(2)}
            unit="cm"
            description="Ultrasonic sensor"
            status={waterStatus}
          />


          <SensorCard
            icon={Wind}
            title="Gas Sensor"
            value={Number(
              current.gas_raw || 0
            )}
            unit=""
            description="MQ-135 raw value"
            status={gasStatus}
          />

        </section>


        {/* ================================================
            STATUS SECTION
        ================================================= */}

        <section className="status-grid">


          <div className="status-card">

            <div className="status-card-icon">
              <Droplets size={23} />
            </div>

            <div>

              <span>
                Water Status
              </span>

              <StatusBadge
                status={waterStatus}
              />

            </div>

          </div>


          <div className="status-card">

            <div className="status-card-icon">
              <Wind size={23} />
            </div>

            <div>

              <span>
                Gas Status
              </span>

              <StatusBadge
                status={gasStatus}
              />

            </div>

          </div>


          <div className="status-card">

            <div className="status-card-icon">
              <History size={23} />
            </div>

            <div>

              <span>
                Stored Readings
              </span>

              <strong>
                {history.length}
              </strong>

            </div>

          </div>


          <div className="status-card">

            <div className="status-card-icon">
              <RefreshCw size={23} />
            </div>

            <div>

              <span>
                Manhole ID
              </span>

              <strong>
                {MANHOLE_ID}
              </strong>

            </div>

          </div>

        </section>


        {/* ================================================
            CHARTS
        ================================================= */}

        <section className="charts-grid">


          {/* Temperature/Humidity */}

          <ChartSection
            title="Temperature & Humidity"
            icon={Thermometer}
          >

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                    name="Temperature °C"
                  />

                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={false}
                    name="Humidity %"
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </ChartSection>


          {/* Water */}

          <ChartSection
            title="Water Distance"
            icon={Droplets}
          >

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="water"
                    stroke="#0891b2"
                    strokeWidth={3}
                    dot={false}
                    name="Water Distance cm"
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </ChartSection>


          {/* Gas */}

          <ChartSection
            title="MQ-135 Gas Sensor"
            icon={Wind}
          >

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="gas"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={false}
                    name="Gas Raw Value"
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </ChartSection>

        </section>


        {/* ================================================
            HISTORY TABLE
        ================================================= */}

        <section className="history-card">

          <div className="history-header">

            <div className="chart-title">

              <History size={20} />

              <span>
                Sensor History
              </span>

            </div>

            <span>
              {history.length} readings
            </span>

          </div>


          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Timestamp
                  </th>

                  <th>
                    Temperature
                  </th>

                  <th>
                    Humidity
                  </th>

                  <th>
                    Water Distance
                  </th>

                  <th>
                    Water Status
                  </th>

                  <th>
                    Gas Value
                  </th>

                  <th>
                    Gas Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {history
                  .slice(-20)
                  .reverse()
                  .map(function (item) {

                    return (

                      <tr key={item.id}>

                        <td>
                          {item.timestamp}
                        </td>

                        <td>
                          {item.temperature.toFixed(1)}
                          {" °C"}
                        </td>

                        <td>
                          {item.humidity.toFixed(1)}
                          {" %"}
                        </td>

                        <td>
                          {item.water_level_cm.toFixed(2)}
                          {" cm"}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              item.water_status
                            }
                          />
                        </td>

                        <td>
                          {item.gas_raw}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              item.gas_status
                            }
                          />
                        </td>

                      </tr>

                    );

                  })}


                {history.length === 0 && (

                  <tr>

                    <td
                      colSpan="7"
                      className="no-data"
                    >
                      No historical Firebase
                      data available yet.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>


      {/* ================================================
          FOOTER
      ================================================= */}

      <footer>

        Smart Manhole Monitoring System

        {" | "}

        ESP32 + DHT11 + Ultrasonic + MQ-135 + Firebase

      </footer>

    </div>

  );
}

export default App;