-- Active: 1775517140698@@188.245.124.222@54332@postgres
create table if not exists sensor_readings (
  id bigint primary key,
  received_at timestamp not null default timezone('utc', now()),
  raw_line text not null,

  p1_ohms double precision not null,
  p2_ohms double precision not null,
  p3_ohms double precision not null,
  p4_ohms double precision not null,
  p5_ohms double precision not null,
  p6_ohms double precision not null,

  p1_status_code integer not null,
  p2_status_code integer not null,
  p3_status_code integer not null,
  p4_status_code integer not null,
  p5_status_code integer not null,
  p6_status_code integer not null,

  boost_voltage_v double precision not null,
  box_status_code integer not null,

  datacenter_id integer not null,
  machine_id integer not null
);

create index if not exists sensor_readings_received_at_idx
  on sensor_readings (received_at desc);

create index if not exists sensor_readings_p1_status_alert_idx
  on sensor_readings (received_at desc)
  where p1_status_code <> 0;

create index if not exists sensor_readings_p2_status_alert_idx
  on sensor_readings (received_at desc)
  where p2_status_code <> 0;

create index if not exists sensor_readings_p3_status_alert_idx
  on sensor_readings (received_at desc)
  where p3_status_code <> 0;

create index if not exists sensor_readings_p4_status_alert_idx
  on sensor_readings (received_at desc)
  where p4_status_code <> 0;

create index if not exists sensor_readings_p5_status_alert_idx
  on sensor_readings (received_at desc)
  where p5_status_code <> 0;

create index if not exists sensor_readings_p6_status_alert_idx
  on sensor_readings (received_at desc)
  where p6_status_code <> 0;

create index if not exists sensor_readings_box_status_alert_idx
  on sensor_readings (received_at desc)
  where box_status_code <> 0;

create index if not exists sensor_readings_p1_low_ohms_idx
  on sensor_readings (received_at desc)
  where p1_ohms < 10;

create index if not exists sensor_readings_p2_low_ohms_idx
  on sensor_readings (received_at desc)
  where p2_ohms < 10;

create index if not exists sensor_readings_p3_low_ohms_idx
  on sensor_readings (received_at desc)
  where p3_ohms < 10;

create index if not exists sensor_readings_p4_low_ohms_idx
  on sensor_readings (received_at desc)
  where p4_ohms < 10;

create index if not exists sensor_readings_p5_low_ohms_idx
  on sensor_readings (received_at desc)
  where p5_ohms < 10;

create index if not exists sensor_readings_p6_low_ohms_idx
  on sensor_readings (received_at desc)
  where p6_ohms < 10;
