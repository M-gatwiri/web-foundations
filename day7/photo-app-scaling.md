# Day 7 Assignment: Photo App Scaling Plan

## 1. Assumptions

The following assumptions are used to estimate the infrastructure requirements for SnapShare, a photo-sharing application.

* Total registered users: 10,000,000.
* Daily active users (DAU): 10% of registered users.
* Each active user uploads one photo per day.
* Each active user views 50 feed pages per day.
* Average original photo size: 2 MB.
* Average thumbnail size: 50 KB.
* There are 86,400 seconds in a day and 365 days in a year.
* Peak feed traffic is five times the average traffic.
* Each feed page view is counted as one request for this estimate. Additional API requests, such as likes, comments, and authentication, are excluded.
* Each uploaded photo produces one thumbnail.
* Storage estimates assume photos and thumbnails are retained for one year without deletion or compression beyond the stated file sizes.
* All registered users are assumed to have equal usage patterns among the daily active users.

## 2. Traffic and Storage Calculations

### A. Daily Active Users

Daily active users are calculated as:

Daily active users = Total registered users × Daily activity percentage

= 10,000,000 × 10%

= **1,000,000 daily active users**

### B. Photo Uploads Per Second

Each daily active user uploads one photo per day.

Daily uploads = 1,000,000 × 1

= 1,000,000 uploads per day

Average uploads per second = Daily uploads ÷ Seconds per day

= 1,000,000 ÷ 86,400

= **11.57 uploads per second**

This is the average upload rate throughout the day.

### C. Feed Views Per Second

Each daily active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

= 50,000,000 feed views per day

Average feed views per second:

= 50,000,000 ÷ 86,400

= **578.70 feed views per second**

Peak feed views per second are estimated using the required multiplier of 5.

Peak feed views per second = Average feed views per second × 5

= 578.70 × 5

= **2,893.52 feed views per second**

Therefore, the system should be designed to handle approximately 2,894 feed views per second during peak traffic, with additional capacity for other API requests and unexpected traffic spikes.

### D. Photo Storage Per Year

Each original photo occupies 2 MB.

Daily original photo storage:

= 1,000,000 × 2 MB

= 2,000,000 MB per day

= 2 TB per day, using decimal storage units.

Annual original photo storage:

= 2 TB × 365

= **730 TB per year**

Each thumbnail occupies 50 KB.

Daily thumbnail storage:

= 1,000,000 × 50 KB

= 50,000,000 KB per day

= 50 GB per day, using decimal storage units.

Annual thumbnail storage:

= 50 GB × 365

= **18.25 TB per year**

Total annual photo storage:

= Original photo storage + Thumbnail storage

= 730 TB + 18.25 TB

= **748.25 TB per year**

This estimate excludes database records, backups, replication overhead, and temporary files. Actual storage requirements will be higher if these are included.

## 3. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system**.

The application receives approximately 50 million feed page views per day compared with 1 million photo uploads per day. This means that feed views occur 50 times as often as uploads.

The architecture must therefore prioritize fast feed retrieval and efficient delivery of photos to users.

The design will use caching to reduce repeated database queries, a read replica to distribute database read traffic, and a CDN to deliver photos and thumbnails closer to users. A load balancer will distribute incoming requests across multiple application servers so that no single server handles all the traffic.

The system will also use a queue for thumbnail generation so that uploading a photo does not require the user to wait for image processing to finish.

## 4. Why Photos Should Not Be Stored Inside the Database

Original photos and thumbnails should be stored in object storage rather than directly inside the database.

Photo files are large binary objects. Storing them directly in the database would increase database size, consume database resources, make backups and restores more expensive, and potentially reduce performance when serving large numbers of images.

Object storage is designed to store and retrieve large files efficiently and can scale to accommodate hundreds of terabytes or more.

The database should instead store metadata about each photo, such as its ID, owner, caption, upload timestamp, and object storage key or URL.

This separation allows the database to focus on structured information while object storage handles the photo files. A CDN can then cache and deliver those files efficiently to users.

## 5. Architecture Diagram

```text
                        +------------------+
                        |      Users       |
                        +------------------+
                                  |
                                  v
                        +------------------+
                        |       CDN        |
                        | Photos/Thumbnails|
                        +------------------+
                                  |
                                  v
                        +------------------+
                        |  Load Balancer   |
                        +------------------+
                                  |
                    +-------------+-------------+
                    |             |             |
                    v             v             v
              +-----------+ +-----------+ +-----------+
              | App       | | App       | | App       |
              | Server 1  | | Server 2  | | Server 3  |
              +-----------+ +-----------+ +-----------+
                    |             |             |
                    +-------------+-------------+
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
             +--------------+            +--------------+
             | Cache        |            | Message Queue|
             | Feed/Metadata|            | Thumbnail Job|
             +--------------+            +--------------+
                    |                           |
                    v                           v
             +--------------+            +--------------+
             | Database     |            | Thumbnail     |
             | Primary      |            | Worker        |
             +--------------+            +--------------+
                    |                           |
                    v                           v
             +--------------+            +--------------+
             | Read Replica |            | Object       |
             |              |            | Storage      |
             +--------------+            | Originals +  |
                    |                    | Thumbnails   |
                    v                    +--------------+
             Read-heavy queries                  ^
                                                 |
                                                 |
                                        +------------------+
                                        | Photo Uploads    |
                                        | from App Servers  |
                                        +------------------+
```

**Diagram note:** The CDN serves cached photo files and thumbnails. App servers handle API requests, while the database primary manages writes and the read replica handles suitable read queries. Uploaded originals go directly to object storage through the application or a controlled upload URL. A message queue sends thumbnail-generation jobs to a worker, which stores the resulting thumbnails in object storage.

## 6. Components and the Problems They Solve

1. **CDN:** Caches and delivers photos and thumbnails from locations closer to users, reducing latency and the load on the application servers and object storage.

2. **Load Balancer:** Distributes incoming API requests across available application servers to prevent one server from becoming overloaded and to improve availability.

3. **Application Servers:** Handle application logic, authenticate users, process uploads, retrieve feed data, and coordinate communication with the cache, database, queue, and object storage.

4. **Cache:** Stores frequently accessed feed data and metadata so repeated requests can be served quickly without querying the database every time.

5. **Primary Database:** Stores structured information such as users, photo metadata, follow relationships, and feed-related records while handling data writes.

6. **Read Replica:** Maintains a replicated copy of database data for read queries, reducing the read workload on the primary database.

7. **Object Storage:** Stores original photos and generated thumbnails separately from the database, allowing photo storage to scale without unnecessarily increasing database size.

8. **Message Queue:** Holds thumbnail-generation jobs so image processing can happen asynchronously without delaying the upload response.

9. **Thumbnail Worker:** Processes queued jobs, generates smaller thumbnail images, and uploads them to object storage so the feed can load images faster.

## 7. Step-by-Step Photo Upload Flow

1. **User selects a photo:** The user selects an image and submits it through the SnapShare application.

2. **Request reaches the application:** The request passes through the load balancer, which routes it to an available application server.

3. **Authentication and validation:** The application server verifies the user's identity and checks that the file meets the application's file type and size restrictions.

4. **Photo is stored:** The original image is uploaded to object storage, preferably using a controlled, short-lived upload URL when appropriate.

5. **Metadata is saved:** The application server writes a database record containing the photo ID, owner, caption, timestamp, and object storage key.

6. **Thumbnail job is queued:** The application publishes a thumbnail-generation job to the message queue, including the photo ID and the original object's storage key.

7. **Upload is acknowledged:** Once the original photo and required metadata have been saved and the thumbnail job has been accepted by the queue, the application can confirm that the upload was successful.

8. **Worker processes the job:** A thumbnail worker retrieves the job from the queue and downloads or reads the original photo from object storage.

9. **Thumbnail is generated:** The worker resizes the image and compresses it to create a smaller thumbnail, targeting an average size of 50 KB.

10. **Thumbnail is stored:** The worker uploads the generated thumbnail to object storage and associates its storage key with the photo record if necessary.

11. **Photo becomes available in the feed:** The application can display the original photo and thumbnail using their storage references, with the CDN caching and delivering the image files.

12. **Failures are handled:** If thumbnail generation fails, the job can be retried, and repeated failures can be sent to a dead-letter queue for investigation. The original photo remains stored even if thumbnail processing is temporarily unavailable.

## 8. Architectural Trade-Offs

### Trade-Off 1: Caching Versus Data Freshness

Caching improves feed performance and reduces database load because frequently requested information can be returned without repeatedly querying the database.

However, cached information may become outdated when a user uploads a new photo, changes their profile, or follows someone new. The system needs a cache invalidation or expiration strategy to balance performance with freshness.

### Trade-Off 2: Read Replicas Versus Consistency

Read replicas allow the application to distribute read traffic and reduce pressure on the primary database.

However, replication may be delayed. A user might upload a photo successfully and then temporarily fail to see it when a subsequent feed request is served by a replica that has not received the latest update. Critical read-after-write requests can be directed to the primary database when necessary.

### Trade-Off 3: Asynchronous Thumbnail Generation Versus Immediate Availability

Using a queue and background worker allows the application to acknowledge uploads without waiting for thumbnail generation, improving the user's upload experience.

However, the thumbnail may not be available immediately. The application must handle this delay by showing a placeholder or original image until the thumbnail is ready, and it must also monitor and retry failed jobs.

### Trade-Off 4: Object Storage and CDN Versus Operational Complexity

Object storage and a CDN provide scalable photo storage and fast image delivery while reducing the amount of traffic handled directly by application servers.

However, they introduce additional costs and operational complexity, including CDN configuration, cache invalidation, access control, storage lifecycle policies, and monitoring.

## 9. Conclusion

SnapShare has 10 million registered users and approximately 1 million daily active users. Under the stated assumptions, it handles 1 million photo uploads and 50 million feed views per day, with peak feed traffic estimated at approximately 2,894 views per second.

The system is read-heavy, so the architecture prioritizes fast content delivery through a CDN, caching, load balancing, and database read replicas. Original photos and thumbnails are stored in object storage, while the database maintains their metadata. A message queue and background worker generate thumbnails asynchronously, allowing uploads to remain responsive as the application scales.

This architecture separates storage, application processing, and read traffic so that each component can scale according to its workload.
