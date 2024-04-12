/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    ComponentRunStatusRequest,
    CreateComponentRequest,
    CreateConnection,
    CreatePortRequest,
    CreateProcessGroupRequest,
    CreateProcessorRequest,
    CreateRemoteProcessGroupRequest,
    DeleteComponentRequest,
    FlowComparisonEntity,
    FlowUpdateRequestEntity,
    GoToRemoteProcessGroupRequest,
    ProcessGroupRunStatusRequest,
    ReplayLastProvenanceEventRequest,
    RunOnceRequest,
    SaveToVersionControlRequest,
    Snippet,
    StartComponentRequest,
    StartProcessGroupRequest,
    StopComponentRequest,
    StopProcessGroupRequest,
    StopVersionControlRequest,
    UpdateComponentRequest,
    UploadProcessGroupRequest,
    VersionControlInformationEntity
} from '../state/flow';
import { ComponentType, PropertyDescriptorRetriever } from '../../../state/shared';
import { Client } from '../../../service/client.service';
import { NiFiCommon } from '../../../service/nifi-common.service';
import { ClusterConnectionService } from '../../../service/cluster-connection.service';

@Injectable({ providedIn: 'root' })
export class FlowService implements PropertyDescriptorRetriever {
    private static readonly API: string = '../nifi-api';

    constructor(
        private httpClient: HttpClient,
        private client: Client,
        private nifiCommon: NiFiCommon,
        private clusterConnectionService: ClusterConnectionService
    ) {}

    getFlow(processGroupId = 'root'): Observable<any> {
        const uiOnly: any = { uiOnly: true };
        return this.httpClient.get(`${FlowService.API}/flow/process-groups/${processGroupId}`, {
            params: uiOnly
        });
    }

    getProcessGroupStatus(processGroupId = 'root', recursive = false): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/flow/process-groups/${processGroupId}/status`, {
            params: { recursive }
        });
    }

    getFlowStatus(): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/flow/status`);
    }

    getControllerBulletins(): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/flow/controller/bulletins`);
    }

    getParameterContexts(): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/flow/parameter-contexts`);
    }

    getParameterContext(id: string): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/parameter-contexts/${id}`, {
            params: { includeInheritedParameters: true }
        });
    }

    getProcessor(id: string): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/processors/${id}`);
    }

    getInputPort(id: string): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/input-ports/${id}`);
    }

    getRemoteProcessGroup(id: string): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/remote-process-groups/${id}`);
    }

    getConnection(id: string): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/connections/${id}`);
    }

    getProcessGroup(id: string): Observable<any> {
        return this.httpClient.get(`${FlowService.API}/process-groups/${id}`);
    }

    createFunnel(processGroupId = 'root', createFunnel: CreateComponentRequest): Observable<any> {
        return this.httpClient.post(`${FlowService.API}/process-groups/${processGroupId}/funnels`, {
            revision: createFunnel.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            component: {
                position: createFunnel.position
            }
        });
    }

    createLabel(processGroupId = 'root', createLabel: CreateComponentRequest): Observable<any> {
        return this.httpClient.post(`${FlowService.API}/process-groups/${processGroupId}/labels`, {
            revision: createLabel.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            component: {
                position: createLabel.position
            }
        });
    }

    goToRemoteProcessGroup(goToRemoteProcessGroupRequest: GoToRemoteProcessGroupRequest) {
        window.open(encodeURI(goToRemoteProcessGroupRequest.uri));
    }

    createProcessor(processGroupId = 'root', createProcessor: CreateProcessorRequest): Observable<any> {
        return this.httpClient.post(`${FlowService.API}/process-groups/${processGroupId}/processors`, {
            revision: createProcessor.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            component: {
                position: createProcessor.position,
                type: createProcessor.processorType,
                bundle: createProcessor.processorBundle
            }
        });
    }

    createConnection(processGroupId = 'root', createConnection: CreateConnection): Observable<any> {
        return this.httpClient.post(
            `${FlowService.API}/process-groups/${processGroupId}/connections`,
            createConnection.payload
        );
    }

    createProcessGroup(processGroupId = 'root', createProcessGroup: CreateProcessGroupRequest): Observable<any> {
        const payload: any = {
            revision: createProcessGroup.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            component: {
                position: createProcessGroup.position,
                name: createProcessGroup.name
            }
        };

        if (createProcessGroup.parameterContextId) {
            payload.component.parameterContext = {
                id: createProcessGroup.parameterContextId
            };
        }

        return this.httpClient.post(`${FlowService.API}/process-groups/${processGroupId}/process-groups`, payload);
    }

    createRemoteProcessGroup(
        processGroupId = 'root',
        createRemoteProcessGroup: CreateRemoteProcessGroupRequest
    ): Observable<any> {
        const payload: any = {
            revision: createRemoteProcessGroup.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            component: {
                position: createRemoteProcessGroup.position,
                targetUris: createRemoteProcessGroup.targetUris,
                transportProtocol: createRemoteProcessGroup.transportProtocol,
                localNetworkInterface: createRemoteProcessGroup.localNetworkInterface,
                proxyHost: createRemoteProcessGroup.proxyHost,
                proxyPort: createRemoteProcessGroup.proxyPort,
                proxyUser: createRemoteProcessGroup.proxyUser,
                proxyPassword: createRemoteProcessGroup.proxyPassword,
                communicationsTimeout: createRemoteProcessGroup.communicationsTimeout,
                yieldDuration: createRemoteProcessGroup.yieldDuration
            }
        };

        return this.httpClient.post(
            `${FlowService.API}/process-groups/${processGroupId}/remote-process-groups`,
            payload
        );
    }

    uploadProcessGroup(processGroupId = 'root', uploadProcessGroup: UploadProcessGroupRequest): Observable<any> {
        const payload = new FormData();
        payload.append('id', processGroupId);
        payload.append('groupName', uploadProcessGroup.name);
        payload.append('positionX', uploadProcessGroup.position.x.toString());
        payload.append('positionY', uploadProcessGroup.position.y.toString());
        payload.append('clientId', uploadProcessGroup.revision.clientId);
        payload.append(
            'disconnectedNodeAcknowledged',
            String(this.clusterConnectionService.isDisconnectionAcknowledged())
        );
        payload.append('file', uploadProcessGroup.flowDefinition);

        return this.httpClient.post(
            `${FlowService.API}/process-groups/${processGroupId}/process-groups/upload`,
            payload
        );
    }

    getPropertyDescriptor(id: string, propertyName: string, sensitive: boolean): Observable<any> {
        const params: any = {
            propertyName,
            sensitive
        };
        return this.httpClient.get(`${FlowService.API}/processors/${id}/descriptors`, {
            params
        });
    }

    createPort(processGroupId = 'root', createPort: CreatePortRequest): Observable<any> {
        const portType: string = ComponentType.InputPort == createPort.type ? 'input-ports' : 'output-ports';
        return this.httpClient.post(`${FlowService.API}/process-groups/${processGroupId}/${portType}`, {
            revision: createPort.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            component: {
                position: createPort.position,
                name: createPort.name,
                allowRemoteAccess: createPort.allowRemoteAccess
            }
        });
    }

    updateComponent(updateComponent: UpdateComponentRequest): Observable<any> {
        return this.httpClient.put(this.nifiCommon.stripProtocol(updateComponent.uri), updateComponent.payload);
    }

    deleteComponent(deleteComponent: DeleteComponentRequest): Observable<any> {
        const params = new HttpParams({
            fromObject: {
                ...this.client.getRevision(deleteComponent.entity),
                disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged()
            }
        });
        return this.httpClient.delete(this.nifiCommon.stripProtocol(deleteComponent.uri), { params });
    }

    createSnippet(snippet: Snippet): Observable<any> {
        return this.httpClient.post(`${FlowService.API}/snippets`, {
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            snippet
        });
    }

    moveSnippet(snippetId: string, groupId: string): Observable<any> {
        const payload: any = {
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            snippet: {
                id: snippetId,
                parentGroupId: groupId
            }
        };
        return this.httpClient.put(`${FlowService.API}/snippets/${snippetId}`, payload);
    }

    deleteSnippet(snippetId: string): Observable<any> {
        const params = new HttpParams({
            fromObject: {
                disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged()
            }
        });
        return this.httpClient.delete(`${FlowService.API}/snippets/${snippetId}`, { params });
    }

    replayLastProvenanceEvent(request: ReplayLastProvenanceEventRequest): Observable<any> {
        return this.httpClient.post(`${FlowService.API}/provenance-events/latest/replays`, request);
    }

    runOnce(request: RunOnceRequest): Observable<any> {
        const startRequest: ComponentRunStatusRequest = {
            revision: request.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            state: 'RUN_ONCE'
        };
        return this.httpClient.put(`${this.nifiCommon.stripProtocol(request.uri)}/run-status`, startRequest);
    }

    startComponent(request: StartComponentRequest): Observable<any> {
        const startRequest: ComponentRunStatusRequest = {
            revision: request.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            state: request.type === ComponentType.RemoteProcessGroup ? 'TRANSMITTING' : 'RUNNING'
        };
        return this.httpClient.put(`${this.nifiCommon.stripProtocol(request.uri)}/run-status`, startRequest);
    }

    stopComponent(request: StopComponentRequest): Observable<any> {
        const stopRequest: ComponentRunStatusRequest = {
            revision: request.revision,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            state: 'STOPPED'
        };
        return this.httpClient.put(`${this.nifiCommon.stripProtocol(request.uri)}/run-status`, stopRequest);
    }

    startProcessGroup(request: StartProcessGroupRequest): Observable<any> {
        const startRequest: ProcessGroupRunStatusRequest = {
            id: request.id,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            state: 'RUNNING'
        };
        return this.httpClient.put(`${FlowService.API}/flow/process-groups/${request.id}`, startRequest);
    }

    startRemoteProcessGroupsInProcessGroup(request: StartProcessGroupRequest): Observable<any> {
        const startRequest = {
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            state: 'TRANSMITTING'
        };
        return this.httpClient.put(
            `${FlowService.API}/remote-process-groups/process-group/${request.id}/run-status`,
            startRequest
        );
    }

    stopProcessGroup(request: StopProcessGroupRequest): Observable<any> {
        const stopRequest: ProcessGroupRunStatusRequest = {
            id: request.id,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            state: 'STOPPED'
        };
        return this.httpClient.put(`${FlowService.API}/flow/process-groups/${request.id}`, stopRequest);
    }

    stopRemoteProcessGroupsInProcessGroup(request: StopProcessGroupRequest): Observable<any> {
        const stopRequest = {
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged(),
            state: 'STOPPED'
        };
        return this.httpClient.put(
            `${FlowService.API}/remote-process-groups/process-group/${request.id}/run-status`,
            stopRequest
        );
    }

    getVersionInformation(processGroupId: string): Observable<VersionControlInformationEntity> {
        return this.httpClient.get(
            `${FlowService.API}/versions/process-groups/${processGroupId}`
        ) as Observable<VersionControlInformationEntity>;
    }

    saveToFlowRegistry(request: SaveToVersionControlRequest): Observable<VersionControlInformationEntity> {
        const saveRequest = {
            ...request,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged()
        };

        return this.httpClient.post(
            `${FlowService.API}/versions/process-groups/${request.processGroupId}`,
            saveRequest
        ) as Observable<VersionControlInformationEntity>;
    }

    stopVersionControl(request: StopVersionControlRequest): Observable<VersionControlInformationEntity> {
        const params: any = {
            version: request.revision.version,
            clientId: request.revision.clientId,
            disconnectedNodeAcknowledged: this.clusterConnectionService.isDisconnectionAcknowledged()
        };
        return this.httpClient.delete(`${FlowService.API}/versions/process-groups/${request.processGroupId}`, {
            params
        }) as Observable<VersionControlInformationEntity>;
    }

    initiateChangeVersionUpdate(request: VersionControlInformationEntity) {
        return this.httpClient.post(
            `${FlowService.API}/versions/update-requests/process-groups/${request.versionControlInformation?.groupId}`,
            {
                ...request
            }
        ) as Observable<FlowUpdateRequestEntity>;
    }

    getChangeVersionUpdateRequest(requestId: string) {
        return this.httpClient.get(
            `${FlowService.API}/versions/update-requests/${requestId}`
        ) as Observable<FlowUpdateRequestEntity>;
    }

    deleteChangeVersionUpdateRequest(requestId: string) {
        const params = {
            disconnectedNodeAcknowledged: false
        };
        return this.httpClient.delete(`${FlowService.API}/versions/update-requests/${requestId}`, {
            params
        }) as Observable<FlowUpdateRequestEntity>;
    }

    initiateRevertFlowVersion(request: VersionControlInformationEntity) {
        return this.httpClient.post(
            `${FlowService.API}/versions/revert-requests/process-groups/${request.versionControlInformation?.groupId}`,
            {
                ...request
            }
        ) as Observable<FlowUpdateRequestEntity>;
    }

    getRevertChangesUpdateRequest(requestId: string) {
        return this.httpClient.get(
            `${FlowService.API}/versions/revert-requests/${requestId}`
        ) as Observable<FlowUpdateRequestEntity>;
    }

    deleteRevertChangesUpdateRequest(requestId: string) {
        const params = {
            disconnectedNodeAcknowledged: false
        };
        return this.httpClient.delete(`${FlowService.API}/versions/revert-requests/${requestId}`, {
            params
        }) as Observable<FlowUpdateRequestEntity>;
    }

    getLocalModifications(processGroupId: string): Observable<FlowComparisonEntity> {
        return this.httpClient.get(
            `${FlowService.API}/process-groups/${processGroupId}/local-modifications`
        ) as Observable<FlowComparisonEntity>;
    }
}
