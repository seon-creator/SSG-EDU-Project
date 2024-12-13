from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from app.utils.database import db

class ChatSession:
    def __init__(self, **kwargs):
        self._id: ObjectId = kwargs.get('_id')
        self.name: str = kwargs.get('name')
        self.user_id: ObjectId = kwargs.get('user_id')
        self.start_time: datetime = kwargs.get('start_time', datetime.utcnow())
        self.end_time: Optional[datetime] = kwargs.get('end_time')

    @classmethod
    def create(cls, user_id: str, name: Optional[str] = None) -> Dict[str, Any]:
        session_data = {
            'user_id': ObjectId(user_id),
            'name': name or f"새 채팅 {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
            'start_time': datetime.utcnow(),
        }
        try:
            result = db.chat_sessions.insert_one(session_data)
            session = cls.find_by_id(result.inserted_id)
            return cls.to_dict(session)
        except Exception as e:
            raise Exception(f"채팅 세션 생성 오류: {str(e)}")

    @classmethod
    def find_by_id(cls, session_id: str) -> Optional[Dict[str, Any]]:
        if isinstance(session_id, str):
            session_id = ObjectId(session_id)
        return db.chat_sessions.find_one({'_id': session_id})

    @classmethod
    def list_user_sessions(cls, user_id: str, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        sessions = list(db.chat_sessions.find({'user_id': user_id})
                        .sort('start_time', -1)
                        .skip(skip)
                        .limit(limit))
        return [cls.to_dict(session) for session in sessions]

    def update(self, **kwargs) -> Optional[Dict[str, Any]]:
        try:
            updates = {}
            allowed_fields = ['name', 'end_time']
            for field in allowed_fields:
                if field in kwargs:
                    updates[field] = kwargs[field]
            if updates:
                db.chat_sessions.update_one(
                    {'_id': ObjectId(self._id)},
                    {'$set': updates}
                )
                return self.find_by_id(self._id)
        except Exception as e:
            raise Exception(f"채팅 세션 업데이트 오류: {str(e)}")

    def delete(self) -> bool:
        try:
            db.messages.delete_many({'session_id': ObjectId(self._id)})
            db.chat_sessions.delete_one({'_id': ObjectId(self._id)})
            return True
        except Exception as e:
            raise Exception(f"채팅 세션 삭제 오류: {str(e)}")

    @staticmethod
    def to_dict(session: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not session:
            return None
        return {
            'id': str(session['_id']),
            'user_id': str(session['user_id']),
            'name': session['name'],
            'start_time': session['start_time'].isoformat(),
            'end_time': session['end_time'].isoformat() if session.get('end_time') else None,
        }

@dataclass
class MessageMetadata:
    intent: Optional[str] = None
    confidence: Optional[float] = None
    entities: List[Dict[str, Any]] = field(default_factory=list)

class Message:
    def __init__(self, **kwargs):
        self._id: ObjectId = kwargs.get('_id')
        self.session_id: ObjectId = kwargs.get('session_id')
        self.type: str = kwargs.get('type')
        self.content: str = kwargs.get('content')
        self.timestamp: datetime = kwargs.get('timestamp', datetime.utcnow())
        self.metadata: Dict = kwargs.get('metadata', {})

    @classmethod
    def create(cls, session_id: str, content: str, type: str = 'user', metadata: Dict = None) -> Dict[str, Any]:
        try:
            if isinstance(session_id, str):
                session_id = ObjectId(session_id)
            message_data = {
                'session_id': session_id,
                'type': type,
                'content': content,
                'timestamp': datetime.utcnow(),
                'metadata': metadata or {}
            }
            result = db.messages.insert_one(message_data)
            message = db.messages.find_one({'_id': result.inserted_id})
            return cls.to_dict(message)
        except Exception as e:
            raise Exception(f"메시지 생성 오류: {str(e)}")

    @classmethod
    def find_by_id(cls, message_id: str) -> Optional[Dict[str, Any]]:
        if isinstance(message_id, str):
            message_id = ObjectId(message_id)
        return db.messages.find_one({'_id': message_id})

    @classmethod
    def list_session_messages(cls, session_id: str, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        if isinstance(session_id, str):
            session_id = ObjectId(session_id)
        messages = list(db.messages.find({'session_id': session_id})
                        .sort('timestamp', 1)
                        .skip(skip)
                        .limit(limit))
        return [cls.to_dict(message) for message in messages]

    def update(self, **kwargs) -> Optional[Dict[str, Any]]:
        try:
            updates = {}
            allowed_fields = ['content', 'metadata']
            for field in allowed_fields:
                if field in kwargs:
                    updates[field] = kwargs[field]
            if updates:
                db.messages.update_one(
                    {'_id': ObjectId(self._id)},
                    {'$set': updates}
                )
                return self.find_by_id(self._id)
        except Exception as e:
            raise Exception(f"메시지 업데이트 오류: {str(e)}")

    def delete(self) -> bool:
        try:
            db.messages.delete_one({'_id': ObjectId(self._id)})
            return True
        except Exception as e:
            raise Exception(f"메시지 삭제 오류: {str(e)}")

    @classmethod
    def delete_by_session(cls, session_id: str) -> bool:
        """세션의 모든 메시지 삭제"""
        try:
            if isinstance(session_id, str):
                session_id = ObjectId(session_id)
            db.messages.delete_many({'session_id': session_id})
            return True
        except Exception as e:
            raise Exception(f"메시지 삭제 오류: {str(e)}")

    @classmethod
    def count_session_messages(cls, session_id: str) -> int:
        if isinstance(session_id, str):
            session_id = ObjectId(session_id)
        return db.messages.count_documents({'session_id': session_id})

    @classmethod
    def get_last_n_messages(cls, session_id: str, n: int = 10) -> List[Dict[str, Any]]:
        if isinstance(session_id, str):
            session_id = ObjectId(session_id)
        messages = list(db.messages.find({'session_id': session_id})
                        .sort('timestamp', -1)
                        .limit(n))
        messages.reverse()
        return [cls.to_dict(message) for message in messages]

    @classmethod
    def search_messages(cls, session_id: str, query: str, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
        if isinstance(session_id, str):
            session_id = ObjectId(session_id)
        messages = list(db.messages.find({
            'session_id': session_id,
            'content': {'$regex': query, '$options': 'i'}
        }).sort('timestamp', 1)
            .skip(skip)
            .limit(limit))
        return [cls.to_dict(message) for message in messages]
    @staticmethod
    def get_messages_for_user_in_day(user_id: str, date: datetime) -> List[Dict[str, Any]]:
        # Xác định khoảng thời gian cho ngày
        start_of_day = datetime(date.year, date.month, date.day)
        end_of_day = start_of_day + timedelta(days=1)

        # Lấy tất cả các phiên chat của người dùng trong ngày
        sessions = ChatSession.list_user_sessions(user_id)

        all_messages = []
        datetime_format = '%Y-%m-%dT%H:%M:%S.%f'  # Điều chỉnh định dạng này cho phù hợp với dữ liệu của bạn

        for session in sessions:
            session_start_time_str = session['start_time']
            session_end_time_str = session.get('end_time') or None  # Sử dụng None nếu end_time bị thiếu

            # Chuyển đổi start_time thành đối tượng datetime
            session_start_time = datetime.strptime(session_start_time_str, datetime_format)

            # Chuyển đổi end_time thành đối tượng datetime, hoặc sử dụng datetime.max nếu nó là None
            if session_end_time_str is not None:
                session_end_time = datetime.strptime(session_end_time_str, datetime_format)
            else:
                session_end_time = datetime.max

            # So sánh các đối tượng datetime
            if session_end_time >= start_of_day and session_start_time < end_of_day:
                # Lấy tất cả các tin nhắn trong phiên chat
                messages = Message.list_session_messages(session['id'])
                # Lọc tin nhắn theo ngày
                for message in messages:
                    message_timestamp = datetime.fromisoformat(message['timestamp'])
                    if start_of_day <= message_timestamp < end_of_day:
                        all_messages.append(message)

        if not all_messages:
            return None  # Hoặc bạn có thể trả về một danh sách rỗng []

        return all_messages
    @staticmethod
    def to_dict(message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not message:
            return None
        return {
            'id': str(message['_id']),
            'session_id': str(message['session_id']),
            'type': message['type'],
            'content': message['content'],
            'timestamp': message['timestamp'].isoformat(),
            'metadata': message.get('metadata', {})
        }

class Report:
    def __init__(self, **kwargs):
        self._id: ObjectId = kwargs.get('_id')
        self.user_id: ObjectId = kwargs.get('user_id')
        self.timestamp: datetime = kwargs.get('timestamp', datetime.utcnow())
        self.symptoms: List[str] = kwargs.get('symptoms', [])
        self.severity: Optional[str] = kwargs.get('severity')
        self.diagnosis: Optional[str] = kwargs.get('diagnosis')
        self.advice: Optional[str] = kwargs.get('advice')

    @classmethod
    def create(cls, user_id: str, symptoms: List[str], severity: Optional[str] = None,
               diagnosis: Optional[str] = None, advice: Optional[str] = None) -> Dict[str, Any]:
        report_data = {
            'user_id': ObjectId(user_id),
            'timestamp': datetime.utcnow(),
            'symptoms': symptoms,
            'severity': severity,
            'diagnosis': diagnosis,
            'advice': advice
        }
        try:
            result = db.reports_chatbot.insert_one(report_data)
            report = cls.find_by_id(result.inserted_id)
            return cls.to_dict(report)  # Chuyển đổi dữ liệu sang dạng dictionary
        except Exception as e:
            raise Exception(f"리포트 생성 오류: {str(e)}")

    @classmethod
    def find_by_id(cls, report_id: str) -> Optional[Dict[str, Any]]:
        if isinstance(report_id, str):
            report_id = ObjectId(report_id)
        return db.reports_chatbot.find_one({'_id': report_id})

    @classmethod
    def list_user_reports(cls, user_id: str, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        reports = list(db.reports_chatbot.find({'user_id': user_id})
                       .sort('timestamp', -1)
                       .skip(skip)
                       .limit(limit))
        return [cls.to_dict(report) for report in reports]
    @classmethod
    def get_report_for_date(cls, user_id: str, date: datetime) -> Optional[Dict[str, Any]]:
        """Get a report for a specific user and date
        
        Args:
            user_id (str): The user ID
            date (datetime): The date to get the report for
            
        Returns:
            Optional[Dict[str, Any]]: Report dictionary or None if not found
        """
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)

            # Define start and end of the day
            start_of_day = datetime(date.year, date.month, date.day)
            end_of_day = start_of_day + timedelta(days=1)
            
            # Query for report within the day
            report = db.reports_chatbot.find_one({
                'user_id': user_id,
                'timestamp': {
                    '$gte': start_of_day,
                    '$lt': end_of_day
                }
            })
            

            return cls.to_dict(report) if report else None

        except Exception as e:
            raise Exception(f"Error getting report for date: {str(e)}")
    @classmethod
    def get_all_user_reports(cls, user_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Get all reports for a user with optional date filtering
        
        Args:
            user_id (str): The user ID
            start_date (datetime, optional): Start date filter
            end_date (datetime, optional): End date filter
            
        Returns:
            List[Dict[str, Any]]: List of report dictionaries
        """
        try:
            # Convert string ID to ObjectId
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
                
            # Build query
            query = {'user_id': user_id}
            
            # Add date filtering if provided
            if start_date or end_date:
                query['timestamp'] = {}
                if start_date:
                    query['timestamp']['$gte'] = start_date
                if end_date:
                    query['timestamp']['$lte'] = end_date

            # Get all reports sorted by timestamp
            reports = list(db.reports_chatbot.find(query).sort('timestamp', -1))
            
            # Convert to dictionary format
            return [cls.to_dict(report) for report in reports]
            
        except Exception as e:
            raise Exception(f"Error getting user reports: {str(e)}")
    @staticmethod
    def to_dict(report: Dict[str, Any]) -> Dict[str, Any]:
        """Chuyển đổi dữ liệu từ cơ sở dữ liệu MongoDB sang định dạng dictionary."""
        return {
            'id': str(report['_id']),
            'user_id': str(report['user_id']),
            'timestamp': report['timestamp'].isoformat() if 'timestamp' in report else None,
            'symptoms': report.get('symptoms', []),
            'severity': report.get('severity'),
            'diagnosis': report.get('diagnosis'),
            'advice': report.get('advice'),
        }

    def update(self, **kwargs) -> Optional[Dict[str, Any]]:
        try:
            updates = {}
            allowed_fields = ['symptoms', 'severity', 'diagnosis', 'advice']
            for field in allowed_fields:
                if field in kwargs:
                    updates[field] = kwargs[field]
            if updates:
                db.reports_chatbot.update_one(
                    {'_id': ObjectId(self._id)},
                    {'$set': updates}
                )
                return self.find_by_id(self._id)
        except Exception as e:
            raise Exception(f"리포트 업데이트 오류: {str(e)}")

    def delete(self) -> bool:
        try:
            db.reports_chatbot.delete_one({'_id': ObjectId(self._id)})
            return True
        except Exception as e:
            raise Exception(f"리포트 삭제 오류: {str(e)}")
