import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, FormControlLabel, Switch,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import scheduleReport from './common/scheduleReport';


import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ReportFilter from './components/ReportFilter';
import ColumnSelect from './components/ColumnSelect';
import useReportStyles from './common/useReportStyles';
import usePersistedState from '../common/util/usePersistedState';
import TableShimmer from '../common/components/TableShimmer';
import { useCatch } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useTranslation } from '../common/components/LocalizationProvider';
import debounce from 'lodash/debounce';

const columnsArray = [
  ['geofenceId', 'sharedGeofence'],
  ['date', 'sharedDate'],
  ['deviceId', 'sharedDevice'],
  ['duration', 'reportDuration'],
];
const columnsMap = new Map(columnsArray);

const GeofenceTimeReportPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const [lastFilters, setLastFilters] = useState(null);

  const devices = useSelector((state) => state.devices.items);
  const geofences = useSelector((state) => state.geofences.items);

  const [columns, setColumns] = usePersistedState('geofenceTimeColumns', ['geofenceId', 'date', 'deviceId', 'duration']);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState(true);

  const handleSubmit = useCallback(useCatch(async (filters) => {
    setLastFilters(filters);
    const { deviceIds, groupIds, from, to, type } = filters;
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    query.append('grouped', grouped.toString());
    if (!grouped) {
      query.append('groupBy', 'day');
    }

    if (type === 'export') {
      window.location.assign(`/api/reports/geofence-time/xlsx?${query.toString()}`);
    } else if (type === 'mail') {
      await fetchOrThrow(`/api/reports/geofence-time/mail?${query.toString()}`);
    } else {
      setLoading(true);
      try {
        const response = await fetchOrThrow(`/api/reports/geofence-time?${query.toString()}`);
        const json = await response.json();
        setItems(json);
      } finally {
        setLoading(false);
      }
    }
  }), [grouped]);

  const debouncedSubmit = useMemo(() => debounce((filters) => {
    handleSubmit(filters);
  }, 500), [handleSubmit]);

  useEffect(() => {
    if (lastFilters) {
      debouncedSubmit(lastFilters);
    }
  }, [grouped]);

  useEffect(() => {
    if (!grouped && !columns.includes('date')) {
      setColumns(prev => [...prev, 'date']);
    } else if (grouped && columns.includes('date')) {
      setColumns(prev => prev.filter(col => col !== 'date'));
    }
  }, [grouped]);

  useEffect(() => {
    return () => {
      debouncedSubmit.cancel();
    };
  }, [debouncedSubmit]);

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'deviceId':
        return devices[value]?.name;
      case 'geofenceId':
        return geofences[value]?.name || value;
      case 'duration': {
        const totalSeconds = Math.floor(value);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const parts = [];
        if (days) parts.push(`${days}day(s)`);
        if (hours) parts.push(`${hours}h`);
        if (minutes) parts.push(`${minutes}m`);
        if (seconds || parts.length === 0) parts.push(`${seconds}s`);

        return parts.join(' ');
      }
      default:
        return value;
    }
  };

  const visibleColumns = useMemo(() => {
    if (grouped) {
      return columns.filter(key => key !== 'deviceId');
    }

    // Custom order when grouped is false
    const customOrder = ['geofenceId', 'date', 'deviceId', 'duration'];
    return customOrder.filter(key => columns.includes(key));
  }, [columns, grouped]);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'Geofence Time Report']}>
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              onShow={handleSubmit}
              onExport={(filters) => handleSubmit({ ...filters, type: 'export' })}
              onSchedule={(deviceIds, groupIds, report) => {
                report.type = 'geofence-time';
                scheduleReport(deviceIds, groupIds, report);
                navigate('/reports/scheduled');
              }}
              multiDevice
              deviceType="multiple"
              includeGroups
              loading={loading}
            >
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsArray={columnsArray}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={grouped}
                    onChange={(e) => setGrouped(e.target.checked)}
                    color="primary"
                  />
                }
                label={t('groupByGeofence')}
              />
            </ReportFilter>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                {visibleColumns.map((key) => (
                  <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.map((item, index) => (
                <TableRow key={index}>
                  {visibleColumns.map((key) => (
                    <TableCell key={key}>
                      {formatValue(item, key)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableShimmer columns={visibleColumns.length} />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default GeofenceTimeReportPage;
