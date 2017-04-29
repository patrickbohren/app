import { Response, ResponseOptions, RequestMethod } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { EntryPointResponse } from './response//entry-point-response';
import { LicensePointResponse } from './response//license-point-response';
import { LocationResponse } from './response//locationResponse';
import { TokenResponse } from './response//tokenResponse';
import { EntriesResponse } from './response/entriesResponse';
import { ArchiveEntryResponse } from './response/archiveEntryResponse';
import { ArchiveTableEntry } from '../models/archiveTableEntry';
import { ArchiveEntry } from '../models/archiveEntry';
import { Token } from '../models/token';
import { Link } from '../models/link';
import { Credential } from '../models/credential';
import { Filter } from '../models/filter';
import { EntriesPoint } from '../models/entries-point';
import { ParentImageEntriesResponse } from './response/parent-image-entries-response';
import { Entries } from '../models/entries';
import { Entry } from '../models/entry';

export class MockImsBackend extends MockBackend {

    public baseUrl: string = 'http://restserver:9000';
    public segmentName: string = 'Ims Mobile Rest Segement';
    public credential: Credential = new Credential(this.baseUrl, 'admin', 'admin', this.segmentName);

    public entryPointUrl: string = this.baseUrl + '/rest';
    public licenseUrl: string = this.entryPointUrl + '/license';
    public infoUrl: string = this.entryPointUrl + '/info';
    public entriesUrl: string = this.entryPointUrl + '/entries';
    public tokensUrl: string = this.licenseUrl + '/tokens';
    public tokenLoadingUrl: string = this.tokensUrl + '/ABCDE';
    public filterId: number = 40;
    public filterResourceUrl: string = this.entriesUrl + '/' + this.filterId;
    public version: string = 'V17Q1';
    public versionResponse = { 'version': this.version };
    public tokenName: string = 'EDFC';
    public tokenExpirationDate: string = '2015-10-28T16:45:12Z';
    public token: Token = new Token(this.tokenName, this.tokenExpirationDate);
    public filterTable: Filter[] = [new Filter(this.filterResourceUrl, this.filterId.toString())];
    public containerRequestUrl: string = this.filterResourceUrl + '/Bild/uploads';
    public parentImageEntriesUrl: string = this.filterResourceUrl + '/Fall';
    public archiveEntry: ArchiveEntry = new  ArchiveEntry('workflow db1', [new ArchiveTableEntry('Art'), new ArchiveTableEntry('Fall', this.parentImageEntriesUrl), new ArchiveTableEntry('Bild', null, null, this.containerRequestUrl)]);
    public uploadContainerUrl: string = this.containerRequestUrl + '/XYZ';
    public imageLocationUrl: string = this.filterResourceUrl + 'Bild/123';
    public parentImageEntries: Entries = new Entries([new Entry().set('IdFall', '1'), new Entry().set('IdFall', '2')]);

    constructor() {
        super();
        this.connections.subscribe((connection) => {
            if (connection.request.url.endsWith(this.entryPointUrl) && connection.request.method === RequestMethod.Get) {
                connection.mockRespond(new EntryPointResponse([new Link('license', this.licenseUrl), new Link('info', this.infoUrl), new Link('entries', this.entriesUrl)]));
            } else if (connection.request.url.endsWith(this.licenseUrl) && connection.request.method === RequestMethod.Get) {
                connection.mockRespond(new LicensePointResponse(null, new Link('tokens', this.tokensUrl)));
            } else if (connection.request.url.endsWith(this.tokensUrl) && connection.request.method === RequestMethod.Post) {
                connection.mockRespond(new LocationResponse(this.tokenLoadingUrl));
            } else if (connection.request.url.endsWith(this.tokenLoadingUrl) && connection.request.method === RequestMethod.Get) {
                connection.mockRespond(new TokenResponse(this.token));
            } else if (connection.request.url.endsWith(this.entriesUrl) && connection.request.method === RequestMethod.Get) {
                connection.mockRespond(new EntriesResponse(new EntriesPoint(this.filterTable)));
            } else if (connection.request.url.endsWith(this.filterResourceUrl) && connection.request.method === RequestMethod.Get) {
                connection.mockRespond(new ArchiveEntryResponse(this.archiveEntry));
            } else if (connection.request.url.endsWith(this.containerRequestUrl) && connection.request.method === RequestMethod.Post) {
                connection.mockRespond(new LocationResponse(this.uploadContainerUrl));
            } else if (connection.request.url.endsWith(this.uploadContainerUrl) && connection.request.method === RequestMethod.Post) {
                connection.mockRespond(new LocationResponse(this.imageLocationUrl));
            } else if (connection.request.url.endsWith(this.parentImageEntriesUrl) && connection.request.method === RequestMethod.Get) {
                connection.mockRespond(new ParentImageEntriesResponse(this.parentImageEntries));
            } else if (connection.request.url.endsWith(this.infoUrl) && connection.request.method === RequestMethod.Get) {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: this.versionResponse
                })));
            } else {
                connection.mockError(new Error('No handling for: ' + connection.request.url));
            }
        });
    }
}
