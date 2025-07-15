# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [schemas/internalapi/v1/schema.proto](#schemas_internalapi_v1_schema-proto)
    - [CreateProjectRequest](#reearth-visualizer-v1-CreateProjectRequest)
    - [CreateProjectResponse](#reearth-visualizer-v1-CreateProjectResponse)
    - [DeleteProjectRequest](#reearth-visualizer-v1-DeleteProjectRequest)
    - [DeleteProjectResponse](#reearth-visualizer-v1-DeleteProjectResponse)
    - [ExportProjectRequest](#reearth-visualizer-v1-ExportProjectRequest)
    - [ExportProjectResponse](#reearth-visualizer-v1-ExportProjectResponse)
    - [GetProjectByAliasRequest](#reearth-visualizer-v1-GetProjectByAliasRequest)
    - [GetProjectByAliasResponse](#reearth-visualizer-v1-GetProjectByAliasResponse)
    - [GetProjectListRequest](#reearth-visualizer-v1-GetProjectListRequest)
    - [GetProjectListResponse](#reearth-visualizer-v1-GetProjectListResponse)
    - [GetProjectRequest](#reearth-visualizer-v1-GetProjectRequest)
    - [GetProjectResponse](#reearth-visualizer-v1-GetProjectResponse)
    - [PageInfo](#reearth-visualizer-v1-PageInfo)
    - [Pagination](#reearth-visualizer-v1-Pagination)
    - [Project](#reearth-visualizer-v1-Project)
    - [ProjectMetadata](#reearth-visualizer-v1-ProjectMetadata)
    - [ProjectSort](#reearth-visualizer-v1-ProjectSort)
    - [PublishProjectRequest](#reearth-visualizer-v1-PublishProjectRequest)
    - [PublishProjectResponse](#reearth-visualizer-v1-PublishProjectResponse)
    - [Story](#reearth-visualizer-v1-Story)
    - [UpdateProjectMetadataRequest](#reearth-visualizer-v1-UpdateProjectMetadataRequest)
    - [UpdateProjectMetadataResponse](#reearth-visualizer-v1-UpdateProjectMetadataResponse)
    - [UpdateProjectRequest](#reearth-visualizer-v1-UpdateProjectRequest)
    - [UpdateProjectResponse](#reearth-visualizer-v1-UpdateProjectResponse)
    - [ValidateProjectAliasRequest](#reearth-visualizer-v1-ValidateProjectAliasRequest)
    - [ValidateProjectAliasResponse](#reearth-visualizer-v1-ValidateProjectAliasResponse)
  
    - [ProjectImportStatus](#reearth-visualizer-v1-ProjectImportStatus)
    - [ProjectSortField](#reearth-visualizer-v1-ProjectSortField)
    - [PublishmentStatus](#reearth-visualizer-v1-PublishmentStatus)
    - [SortDirection](#reearth-visualizer-v1-SortDirection)
    - [Visualizer](#reearth-visualizer-v1-Visualizer)
  
    - [ReEarthVisualizer](#reearth-visualizer-v1-ReEarthVisualizer)
  
- [Scalar Value Types](#scalar-value-types)



<a name="schemas_internalapi_v1_schema-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## schemas/internalapi/v1/schema.proto



<a name="reearth-visualizer-v1-CreateProjectRequest"></a>

### CreateProjectRequest
Creates a new project.
Cannot be created under a team the user does not belong to.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| workspace_id | [string](#string) |  | Workspace ID |
| visualizer | [Visualizer](#reearth-visualizer-v1-Visualizer) |  | Specify VISUALIZER_CESIUM |
| name | [string](#string) | optional | Project title |
| description | [string](#string) | optional | Project description |
| core_support | [bool](#bool) | optional | Set to true |
| visibility | [string](#string) | optional | Visibility of the project (e.g., &#34;public&#34;, &#34;private&#34;) |
| project_alias | [string](#string) | optional | Project alias |
| readme | [string](#string) | optional | Project readme |
| license | [string](#string) | optional | Project license |
| topics | [string](#string) | optional | Project topics |






<a name="reearth-visualizer-v1-CreateProjectResponse"></a>

### CreateProjectResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project | [Project](#reearth-visualizer-v1-Project) |  | Project |






<a name="reearth-visualizer-v1-DeleteProjectRequest"></a>

### DeleteProjectRequest
Deletes a project.
This is a physical deletion, not a logical deletion. Data cannot be restored.
Only the project owner can operate this


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  | Project ID |






<a name="reearth-visualizer-v1-DeleteProjectResponse"></a>

### DeleteProjectResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  | Project ID |






<a name="reearth-visualizer-v1-ExportProjectRequest"></a>

### ExportProjectRequest
Export a project.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  | Project ID |






<a name="reearth-visualizer-v1-ExportProjectResponse"></a>

### ExportProjectResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_data_path | [string](#string) |  | Project Export zip file download url |






<a name="reearth-visualizer-v1-GetProjectByAliasRequest"></a>

### GetProjectByAliasRequest
Find a project by alias.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| alias | [string](#string) |  | Scene alias |






<a name="reearth-visualizer-v1-GetProjectByAliasResponse"></a>

### GetProjectByAliasResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project | [Project](#reearth-visualizer-v1-Project) |  | Project |






<a name="reearth-visualizer-v1-GetProjectListRequest"></a>

### GetProjectListRequest
If the authenticated flag is true, private items will also be included in the
response. However, deleted items are excluded.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| workspace_id | [string](#string) | optional | Workspace ID |
| authenticated | [bool](#bool) |  | Authenticated Flag |
| keyword | [string](#string) | optional | Keyword search |
| sort | [ProjectSort](#reearth-visualizer-v1-ProjectSort) | optional | Sort options |
| pagination | [Pagination](#reearth-visualizer-v1-Pagination) | optional | Pagination info |






<a name="reearth-visualizer-v1-GetProjectListResponse"></a>

### GetProjectListResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| projects | [Project](#reearth-visualizer-v1-Project) | repeated | Project List |
| page_info | [PageInfo](#reearth-visualizer-v1-PageInfo) |  | PageInfo |
| total_count | [int32](#int32) |  | TotalCount |






<a name="reearth-visualizer-v1-GetProjectRequest"></a>

### GetProjectRequest
Retrieves a project regardless of authentication.
Note: Call this only if the user is allowed to view the project.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  | Project ID |






<a name="reearth-visualizer-v1-GetProjectResponse"></a>

### GetProjectResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project | [Project](#reearth-visualizer-v1-Project) |  | Project |






<a name="reearth-visualizer-v1-PageInfo"></a>

### PageInfo



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| total_count | [int64](#int64) |  |  |
| start_cursor | [string](#string) | optional |  |
| end_cursor | [string](#string) | optional |  |
| has_next_page | [bool](#bool) |  |  |
| has_previous_page | [bool](#bool) |  |  |






<a name="reearth-visualizer-v1-Pagination"></a>

### Pagination
Pagination


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| first | [int32](#int32) | optional |  |
| last | [int32](#int32) | optional |  |
| after | [string](#string) | optional |  |
| before | [string](#string) | optional |  |
| limit | [int64](#int64) | optional |  |
| offset | [int64](#int64) | optional |  |






<a name="reearth-visualizer-v1-Project"></a>

### Project
Core Project messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  | Project ID |
| workspace_id | [string](#string) |  | Workspace ID |
| scene_id | [string](#string) |  | Scene ID |
| stories | [Story](#reearth-visualizer-v1-Story) | repeated | Story |
| name | [string](#string) |  | Project title |
| description | [string](#string) |  | Project description |
| image_url | [string](#string) | optional | Project image (URL link) |
| visualizer | [Visualizer](#reearth-visualizer-v1-Visualizer) |  | Type of visualizer (e.g., Cesium) |
| created_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  | Creation date |
| updated_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  | Last updated date |
| is_archived | [bool](#bool) |  | Currently unused |
| core_support | [bool](#bool) |  | Indicates whether it&#39;s a classic or visualizer project type |
| starred | [bool](#bool) |  | Whether the project is marked as a favorite |
| is_deleted | [bool](#bool) |  | Whether the project is in the trash |
| visibility | [string](#string) |  | Visibility of the project (e.g., &#34;public&#34;, &#34;private&#34;) |
| editor_url | [string](#string) |  | URL to visualizer project |
| metadata | [ProjectMetadata](#reearth-visualizer-v1-ProjectMetadata) | optional | Project metadata |
| project_alias | [string](#string) |  | Project alias |
| alias | [string](#string) |  | Scene Publishment value |
| publishment_status | [PublishmentStatus](#reearth-visualizer-v1-PublishmentStatus) |  | Scene Publishment value |
| published_url | [string](#string) | optional | Scene Publishment value |






<a name="reearth-visualizer-v1-ProjectMetadata"></a>

### ProjectMetadata



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  | ProjectMetadata id |
| project_id | [string](#string) |  | Project id |
| workspace_id | [string](#string) |  | Workspace id |
| readme | [string](#string) | optional | Project readme |
| license | [string](#string) | optional | Project license |
| topics | [string](#string) | optional | Project topics |
| import_status | [ProjectImportStatus](#reearth-visualizer-v1-ProjectImportStatus) |  | Project import status — if PROCESSING, data should not be retrieved |
| created_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  | ProjectMetadata created date |
| updated_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  | ProjectMetadata updated date |






<a name="reearth-visualizer-v1-ProjectSort"></a>

### ProjectSort



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| field | [ProjectSortField](#reearth-visualizer-v1-ProjectSortField) |  |  |
| direction | [SortDirection](#reearth-visualizer-v1-SortDirection) |  |  |






<a name="reearth-visualizer-v1-PublishProjectRequest"></a>

### PublishProjectRequest
Update project publish fields.
Only the project owner can operate this


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  | Project ID (required) |
| alias | [string](#string) | optional | Scene Publishment alias |
| publishment_status | [PublishmentStatus](#reearth-visualizer-v1-PublishmentStatus) |  | Scene Publishment status |






<a name="reearth-visualizer-v1-PublishProjectResponse"></a>

### PublishProjectResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project | [Project](#reearth-visualizer-v1-Project) |  | Project |






<a name="reearth-visualizer-v1-Story"></a>

### Story



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  | Story ID |
| story_alias | [string](#string) |  | Story Publishment value |
| story_publishment_status | [PublishmentStatus](#reearth-visualizer-v1-PublishmentStatus) |  | Story Publishment value |
| story_published_url | [string](#string) | optional | Story Publishment value |






<a name="reearth-visualizer-v1-UpdateProjectMetadataRequest"></a>

### UpdateProjectMetadataRequest
Updates a new project metadata.
Cannot be updated under a team the user does not belong to.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  | Project ID |
| readme | [string](#string) | optional | Project readme |
| license | [string](#string) | optional | Project license |
| topics | [string](#string) | optional | Project topics |






<a name="reearth-visualizer-v1-UpdateProjectMetadataResponse"></a>

### UpdateProjectMetadataResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| metadata | [ProjectMetadata](#reearth-visualizer-v1-ProjectMetadata) |  | Project metadata |






<a name="reearth-visualizer-v1-UpdateProjectRequest"></a>

### UpdateProjectRequest
Update project fields.
Only the project owner can operate this


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  | Project ID (required) |
| name | [string](#string) | optional | Project basic info (optional) |
| description | [string](#string) | optional |  |
| archived | [bool](#bool) | optional |  |
| image_url | [string](#string) | optional |  |
| delete_image_url | [bool](#bool) | optional |  |
| scene_id | [string](#string) | optional |  |
| starred | [bool](#bool) | optional |  |
| deleted | [bool](#bool) | optional |  |
| visibility | [string](#string) | optional |  |
| public_title | [string](#string) | optional | Publishment settings (optional) |
| public_description | [string](#string) | optional |  |
| public_image | [string](#string) | optional |  |
| public_no_index | [bool](#bool) | optional |  |
| delete_public_image | [bool](#bool) | optional |  |
| is_basic_auth_active | [bool](#bool) | optional |  |
| basic_auth_username | [string](#string) | optional |  |
| basic_auth_password | [string](#string) | optional |  |
| enable_ga | [bool](#bool) | optional |  |
| tracking_id | [string](#string) | optional |  |
| project_alias | [string](#string) | optional |  |






<a name="reearth-visualizer-v1-UpdateProjectResponse"></a>

### UpdateProjectResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project | [Project](#reearth-visualizer-v1-Project) |  | Project |






<a name="reearth-visualizer-v1-ValidateProjectAliasRequest"></a>

### ValidateProjectAliasRequest
Determines if an alias is valid.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) | optional | Project ID |
| alias | [string](#string) |  | Scene alias |






<a name="reearth-visualizer-v1-ValidateProjectAliasResponse"></a>

### ValidateProjectAliasResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) | optional | Project ID |
| available | [bool](#bool) |  | Scene alias available |
| error_message | [string](#string) | optional | Error message |





 


<a name="reearth-visualizer-v1-ProjectImportStatus"></a>

### ProjectImportStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| NONE | 0 |  |
| PROCESSING | 1 |  |
| FAIL | 2 |  |
| SUCCESS | 3 |  |



<a name="reearth-visualizer-v1-ProjectSortField"></a>

### ProjectSortField


| Name | Number | Description |
| ---- | ------ | ----------- |
| PROJECT_SORT_FIELD_UNSPECIFIED | 0 |  |
| UPDATEDAT | 1 |  |
| NAME | 2 |  |



<a name="reearth-visualizer-v1-PublishmentStatus"></a>

### PublishmentStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| PUBLISHMENT_STATUS_UNSPECIFIED | 0 |  |
| PUBLISHMENT_STATUS_PUBLIC | 1 | The project is published and publicly accessible. |
| PUBLISHMENT_STATUS_LIMITED | 2 | The project is published with limited access. |
| PUBLISHMENT_STATUS_PRIVATE | 3 | The project is unpublished (web files have been deleted). |



<a name="reearth-visualizer-v1-SortDirection"></a>

### SortDirection


| Name | Number | Description |
| ---- | ------ | ----------- |
| SORT_DIRECTION_UNSPECIFIED | 0 |  |
| ASC | 1 |  |
| DESC | 2 |  |



<a name="reearth-visualizer-v1-Visualizer"></a>

### Visualizer


| Name | Number | Description |
| ---- | ------ | ----------- |
| VISUALIZER_UNSPECIFIED | 0 |  |
| VISUALIZER_CESIUM | 1 |  |
| VISUALIZER_CESIUM_BETA | 2 |  |


 

 


<a name="reearth-visualizer-v1-ReEarthVisualizer"></a>

### ReEarthVisualizer


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetProjectList | [GetProjectListRequest](#reearth-visualizer-v1-GetProjectListRequest) | [GetProjectListResponse](#reearth-visualizer-v1-GetProjectListResponse) | Retrieves the list of projects the user can access. Request headers: user-id: &lt;User ID&gt; |
| GetProject | [GetProjectRequest](#reearth-visualizer-v1-GetProjectRequest) | [GetProjectResponse](#reearth-visualizer-v1-GetProjectResponse) | Retrieves a specific project regardless of authentication. Request headers: user-id: &lt;User ID&gt; |
| GetProjectByAlias | [GetProjectByAliasRequest](#reearth-visualizer-v1-GetProjectByAliasRequest) | [GetProjectByAliasResponse](#reearth-visualizer-v1-GetProjectByAliasResponse) | Find a project by alias. Request headers: user-id: &lt;User ID&gt; |
| ValidateProjectAlias | [ValidateProjectAliasRequest](#reearth-visualizer-v1-ValidateProjectAliasRequest) | [ValidateProjectAliasResponse](#reearth-visualizer-v1-ValidateProjectAliasResponse) | Determines if an alias is valid. Request headers: user-id: &lt;User ID&gt; |
| CreateProject | [CreateProjectRequest](#reearth-visualizer-v1-CreateProjectRequest) | [CreateProjectResponse](#reearth-visualizer-v1-CreateProjectResponse) | Creates a new project in the specified team. Request headers: user-id: &lt;User ID&gt; |
| UpdateProject | [UpdateProjectRequest](#reearth-visualizer-v1-UpdateProjectRequest) | [UpdateProjectResponse](#reearth-visualizer-v1-UpdateProjectResponse) | Update a project. Request headers: user-id: &lt;User ID&gt; |
| PublishProject | [PublishProjectRequest](#reearth-visualizer-v1-PublishProjectRequest) | [PublishProjectResponse](#reearth-visualizer-v1-PublishProjectResponse) | Publish a project. Request headers: user-id: &lt;User ID&gt; |
| UpdateProjectMetadata | [UpdateProjectMetadataRequest](#reearth-visualizer-v1-UpdateProjectMetadataRequest) | [UpdateProjectMetadataResponse](#reearth-visualizer-v1-UpdateProjectMetadataResponse) | Updates a new project metadata in the specified team. Request headers: user-id: &lt;User ID&gt; |
| DeleteProject | [DeleteProjectRequest](#reearth-visualizer-v1-DeleteProjectRequest) | [DeleteProjectResponse](#reearth-visualizer-v1-DeleteProjectResponse) | Deletes a project. Request headers: user-id: &lt;User ID&gt; |
| ExportProject | [ExportProjectRequest](#reearth-visualizer-v1-ExportProjectRequest) | [ExportProjectResponse](#reearth-visualizer-v1-ExportProjectResponse) | Export a project. Request headers: user-id: &lt;User ID&gt; |

 



## Scalar Value Types

| .proto Type | Notes | C++ | Java | Python | Go | C# | PHP | Ruby |
| ----------- | ----- | --- | ---- | ------ | -- | -- | --- | ---- |
| <a name="double" /> double |  | double | double | float | float64 | double | float | Float |
| <a name="float" /> float |  | float | float | float | float32 | float | float | Float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum or Fixnum (as required) |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="bool" /> bool |  | bool | boolean | boolean | bool | bool | boolean | TrueClass/FalseClass |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode | string | string | string | String (UTF-8) |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str | []byte | ByteString | string | String (ASCII-8BIT) |

