import inspector from 'inspector';
import ms from 'ms';

jest.setTimeout(inspector.url() ? ms('10m') : ms('10s'));
