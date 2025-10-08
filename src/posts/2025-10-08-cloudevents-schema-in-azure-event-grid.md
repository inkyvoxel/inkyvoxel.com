---
title: CloudEvents Schema in Azure Event Grid
description: An overview of the CloudEvents schema in Azure Event Grid, its benefits compared to the default schema, and what the JSON structure looks like.
tags: [azure, cloud, software-engineering]
---

Azure Event Grid now supports multiple event schemas, with CloudEvents being a particularly compelling choice compared to Azure's own Event Grid schema.

## What is CloudEvents?

CloudEvents is a CNCF (Cloud Native Computing Foundation) specification that provides a standardised way to describe event data. It's vendor-neutral and designed to work consistently across different cloud providers and platforms.

## Benefits over Azure Event Grid Schema

**Vendor Neutrality**: CloudEvents is an open standard supported across multiple cloud providers (AWS, Google Cloud, Azure). This makes it easier to migrate or integrate systems across different platforms without rewriting event handling logic.

**Industry Adoption**: As a CNCF specification, CloudEvents has broad industry support and tooling. Libraries and frameworks that support CloudEvents will work with your Azure Event Grid events out of the box.

**Extensibility**: CloudEvents is designed with extension attributes, making it straightforward to add custom metadata while maintaining schema compatibility.

**Future-Proofing**: Adopting an open standard reduces lock-in and ensures your event architecture remains portable as requirements evolve.

## CloudEvents example

Here's an example of a CloudEvents event:

```json
{
  "specversion": "1.0",
  "type": "com.example.user.created",
  "source": "/users/service",
  "id": "0bcd3a60-6df5-4c2f-b883-2c7cd2da7d14",
  "time": "2025-10-08T14:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "userId": "12345",
    "email": "user@example.com",
    "createdAt": "2025-10-08T14:30:00Z"
  }
}
```

Here's the equivalent event using the Azure Event Grid schema:

```json
{
  "id": "0bcd3a60-6df5-4c2f-b883-2c7cd2da7d14",
  "topic": "/subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.EventGrid/topics/{topic-name}",
  "subject": "/users/service",
  "eventType": "com.example.user.created",
  "eventTime": "2025-10-08T14:30:00Z",
  "dataVersion": "1.0",
  "metadataVersion": "1",
  "data": {
    "userId": "12345",
    "email": "user@example.com",
    "createdAt": "2025-10-08T14:30:00Z"
  }
}
```

The Azure Event Grid schema includes Azure-specific fields like `topic`, `dataVersion`, and `metadataVersion`.

The Azure Event Grid schema requires more Azure infrastructure context (such as subscription ID, resource group, and topic name), making it less portable across platforms.

## Versioning messages

Versioning is crucial for evolving event schemas without breaking existing consumers. CloudEvents supports several approaches, including using extension attributes in the JSON schema, but the recommended approach is type-based versioning.

With type-based versioning, you include the version in the `type` field itself, such as `com.example.user.created.v1` or `com.example.user.created.v2`. This makes the version explicit and allows consumers to route different versions to different handlers.

Here's an example using type-based versioning:

```json
{
  "specversion": "1.0",
  "type": "com.example.user.created.v2",
  "source": "/users/service",
  "id": "0bcd3a60-6df5-4c2f-b883-2c7cd2da7d14",
  "time": "2025-10-08T14:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "userId": "12345",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "createdAt": "2025-10-08T14:30:00Z"
  }
}
```

Note that `"specversion": "1.0"` is the CloudEvents schema version!

The key is to choose a versioning strategy early and apply it consistently across your event-driven architecture.

## When to use CloudEvents

For most new event-driven architectures, CloudEvents offers the flexibility and future-proofing that makes it the recommended choice. The Azure Event Grid documentation now recommends using CloudEvents by default (which was news to me, and made me checkout CloudEvents in the first place). You should only use the Event Grid schema if you have an existing Event Grid system set up and require compatibility.

Use CloudEvents when you need portability, are building multi-cloud solutions, or want to leverage existing CloudEvents tooling, such as Amazon EventBridge, Google Cloud Pub/Sub, or Confluent Kafka.

## Closing thoughts

CloudEvents brings portability to event-driven systems, making it easier to build solutions that can evolve and interoperate across platforms. While Azure’s own Event Grid schema is still supported, adopting CloudEvents is a future-proof choice that aligns with industry standards. If you’re starting a new project or planning for long-term flexibility, CloudEvents is well worth considering.
